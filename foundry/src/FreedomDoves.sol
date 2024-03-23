// SPDX-License-Identifier: MIT
/**
 * @title FreedomDoves
 * @dev A decentralized forum centered around the themes of 'freedom' and 'peace'.
 */
pragma solidity ^0.8.21;

// Importing external contracts.
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AdminNFT} from "./AdminNFT.sol";

// Custom error messages for the FreedomDoves contract.
error FreedomDoves__UpkeepNotNeeded();
error FreedomDoves_YouHaveAlreadyLikedThisPost();
error FreedomDoves_YouHaveAlreadyVotedThisPost();
error FreedomDoves_YouDontHaveAdminNFT();
error FreedomDoves_ThisPostHasBeenDeleted();
error FreedomDoves_NotOwner();
error FreedomDoves_TimeIntervalHasNotPassedYet();

/**
 * @notice FreedomDoves contract - Handles posts, comments, likes, and charitable activities.
 */
contract FreedomDoves {
    // Struct to store post data.
    struct PostData {
        bytes title;
        bytes content;
        address postAuthors;
        uint256 postTime;
        uint256 numberOfDeleteRequest;
        uint256 numberOfLikes;
    }

    // Struct to store comment data.
    struct CommentData {
        bytes content;
        address commentAuthors;
    }

    // Constant variables.
    bytes private constant DELETEDTEXT =
        hex"0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001b5468697320706f737420686173206265656e2064656c65746564210000000000";

    // Immutable variables.
    IERC20 private immutable i_fusdc;
    AdminNFT private immutable i_adminNFT;
    uint256 private immutable i_interval;
    address private immutable i_owner;

    // State variables.
    uint256 private s_lastTimeStamp;
    uint256 private s_postIdCounter;
    uint256[] private s_topThreePostId = new uint256[](3);
    mapping(uint256 => uint256) private s_commentIdCounter;
    mapping(uint256 => PostData) private s_storePost;
    mapping(address => uint256) private s_totalUSDCReward;
    mapping(address => bool) private s_isObtainedNFT;
    mapping(uint256 => mapping(uint256 => CommentData)) private s_storeComment;
    mapping(address => mapping(uint256 => bool)) private s_isLiked;
    mapping(address => mapping(uint256 => bool)) private s_isVoted;
    mapping(uint256 => bool) private s_isDeleted;
    mapping(uint256 => uint256) private s_numberOfLikesThisWeek;

    // Event for requesting random numbers.
    event RequestedRandomNum(uint256 indexed requestId);

    /**
     * @notice Constructor to initialize the FreedomDoves contract.
     * @param updateInterval The execution interval of Chainlink Automation.
     * @param fusdcAddr The address of the FUSDC token contract.
     * @param adminNFTAddr The address of the AdminNFT contract.
     */
    constructor(
        uint256 updateInterval,
        address fusdcAddr,
        address adminNFTAddr
    ) {
        i_fusdc = IERC20(fusdcAddr);
        i_adminNFT = AdminNFT(adminNFTAddr);
        i_interval = updateInterval;
        s_lastTimeStamp = block.timestamp;
        s_postIdCounter = 1;
        i_owner = msg.sender;
    }

    /**
     * @notice Create a new post.
     * @param _title The title of the post.
     * @param _content The content of the post.
     */
    function newPost(bytes memory _title, bytes memory _content) public {
        s_storePost[s_postIdCounter] = PostData(
            _title,
            _content,
            msg.sender,
            block.timestamp,
            0,
            0
        );
        s_postIdCounter++;
    }

    /**
     * @notice Add a new comment to a post.
     * @param postId The ID of the post to comment on.
     * @param _content The content of the comment.
     */
    function newComment(uint256 postId, bytes memory _content) public {
        if (s_isDeleted[postId] == true) {
            revert FreedomDoves_ThisPostHasBeenDeleted();
        }
        uint256 commentId = s_commentIdCounter[postId];
        s_storeComment[postId][commentId] = CommentData(_content, msg.sender);
        s_commentIdCounter[postId]++;
    }

    /**
     * @notice Like a post.
     * @param postId The ID of the post to like.
     */
    function likePost(uint256 postId) public {
        if (s_isLiked[msg.sender][postId] == true) {
            revert FreedomDoves_YouHaveAlreadyLikedThisPost();
        }
        if (s_isDeleted[postId] == true) {
            revert FreedomDoves_ThisPostHasBeenDeleted();
        }
        s_isLiked[msg.sender][postId] = true;
        s_storePost[postId].numberOfLikes++;
        for (uint8 i = 0; i < 3; i++) {
            if (
                s_storePost[postId].numberOfLikes >
                s_storePost[s_topThreePostId[i]].numberOfLikes &&
                block.timestamp - s_storePost[postId].postTime < i_interval
            ) {
                s_topThreePostId[i] = postId;
                break;
            }
        }
    }

    /**
     * @notice Delete a post.
     * @param postId The ID of the post to delete.
     */
    function deletePost(uint256 postId) public {
        if (i_adminNFT.balanceOf(msg.sender) <= 0) {
            revert FreedomDoves_YouDontHaveAdminNFT();
        }
        if (s_isVoted[msg.sender][postId] == true) {
            revert FreedomDoves_YouHaveAlreadyVotedThisPost();
        }
        if (s_isDeleted[postId] == true) {
            revert FreedomDoves_ThisPostHasBeenDeleted();
        }
        s_isVoted[msg.sender][postId] = true;
        s_storePost[postId].numberOfDeleteRequest++;
        if (
            s_storePost[postId].numberOfDeleteRequest >=
            i_adminNFT.getTotalSupply() / 2
        ) {
            s_isDeleted[postId] = true;
            s_storePost[postId].title = DELETEDTEXT;
            s_storePost[postId].content = DELETEDTEXT;
        }
    }

    /**
     * @notice Distributes rewards to the top three post authors.
     */
    function distributeRewards() public {
        if (block.timestamp - s_lastTimeStamp < i_interval) {
            revert FreedomDoves_TimeIntervalHasNotPassedYet();
        }
        if (s_storePost[s_topThreePostId[0]].postAuthors == address(0)) {
            s_lastTimeStamp = block.timestamp;
            return;
        }

        s_lastTimeStamp = block.timestamp;

        for (uint8 i = 3; i > 0; i--) {
            if (s_storePost[s_topThreePostId[i]].postAuthors != address(0)) {
                i_fusdc.transfer(
                    s_storePost[s_topThreePostId[i]].postAuthors,
                    i * 100000000
                );
                if (
                    s_isObtainedNFT[
                        s_storePost[s_topThreePostId[i]].postAuthors
                    ] == false
                ) {
                    i_adminNFT.mintNft(
                        s_storePost[s_topThreePostId[i]].postAuthors
                    );
                    s_isObtainedNFT[
                        s_storePost[s_topThreePostId[i]].postAuthors
                    ] = true;
                }
            }
            s_topThreePostId[i] = 0;
        }
    }

    /**
     * @notice Get the data of a specific post.
     * @param postId The ID of the post.
     * @return The data of the specified post.
     */
    function getPostData(uint256 postId) public view returns (PostData memory) {
        return s_storePost[postId];
    }

    /**
     * @notice Get the total number of posts.
     * @return The total number of posts.
     */
    function getTotalPost() public view returns (uint256) {
        return s_postIdCounter;
    }

    /**
     * @notice Get the data of a specific comment.
     * @param postId The ID of the post.
     * @param commentId The ID of the comment.
     * @return The data of the specified comment.
     */
    function getCommentData(
        uint256 postId,
        uint256 commentId
    ) public view returns (CommentData memory) {
        return s_storeComment[postId][commentId];
    }

    /**
     * @notice Get the total number of comments for a specific post.
     * @param postId The ID of the post.
     * @return The total number of comments for the specified post.
     */
    function getTotalComment(uint256 postId) public view returns (uint256) {
        return s_commentIdCounter[postId];
    }

    /**
     * @notice Check if a user has liked a specific post.
     * @param msgsender The address of the user.
     * @param postId The ID of the post.
     * @return Whether the user has liked the post.
     */
    function getIsLiked(
        address msgsender,
        uint256 postId
    ) public view returns (bool) {
        return s_isLiked[msgsender][postId];
    }

    /**
     * @notice Check if a post has been deleted.
     * @param postId The ID of the post.
     * @return Whether the post has been deleted.
     */
    function getIsDeleted(uint256 postId) public view returns (bool) {
        return s_isDeleted[postId];
    }

    /**
     * @notice Check if a user can vote on a specific post.
     * @param msgsender The address of the user.
     * @param postId The ID of the post.
     * @return Whether the user can vote on the post.
     */
    function getCanVote(
        address msgsender,
        uint256 postId
    ) public view returns (bool) {
        return
            !s_isVoted[msgsender][postId] &&
            i_adminNFT.balanceOf(msgsender) > 0;
    }
}
