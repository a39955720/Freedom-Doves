// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AdminNFT} from "./AdminNFT.sol";

error FreedomDoves__UpkeepNotNeeded();
error FreedomDoves_YouHaveAlreadyLikedThisPost();
error FreedomDoves_YouHaveAlreadyVotedThisPost();
error FreedomDoves_YouDontHaveAdminNFT();
error FreedomDoves_ThisPostHasBeenDeleted();

contract FreedomDoves is AutomationCompatibleInterface, VRFConsumerBaseV2 {
    enum ControllerState {
        OPEN,
        CALCULATING
    }

    struct PostData {
        bytes title;
        bytes content;
        address postAuthors;
        uint256 postTime;
        uint256 numberOfDeleteRequest;
        uint256 numberOfLikes;
    }

    struct CommentData {
        bytes content;
        address commentAuthors;
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 3;

    bytes private constant DELETEDTEXT =
        "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001b5468697320706f737420686173206265656e2064656c65746564210000000000";

    IERC20 private immutable i_fusdc;
    AdminNFT private immutable i_adminNFT;
    uint256 private immutable i_interval;

    ControllerState private s_controllerState;
    uint256 private s_lastTimeStamp;
    uint256 private s_postIdCounter;
    uint256[] private s_topThreePostId = new uint256[](3);

    mapping(uint256 => uint256) private s_commentIdCounter;
    mapping(uint256 => PostData) private s_storePost;
    mapping(uint256 => mapping(uint256 => CommentData)) private s_storeComment;
    mapping(address => mapping(uint256 => bool)) private s_isLiked;
    mapping(address => mapping(uint256 => bool)) private s_isVoted;
    mapping(uint256 => bool) private s_isDeleted;
    mapping(uint256 => uint256) private s_numberOfLikesThisWeek;

    event RequestedRandomNum(uint256 indexed requestId);

    constructor(
        uint256 updateInterval,
        address fusdcAddr,
        address adminNFTAddr,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_fusdc = IERC20(fusdcAddr);
        i_adminNFT = AdminNFT(adminNFTAddr);
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_interval = updateInterval;
        s_lastTimeStamp = block.timestamp;
        s_postIdCounter = 1;
    }

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

    function newComment(uint256 postId, bytes memory _content) public {
        uint256 commentId = s_commentIdCounter[postId];
        s_storeComment[postId][commentId] = CommentData(_content, msg.sender);
        s_commentIdCounter[postId]++;
    }

    function likePost(uint256 postId) public {
        if (s_isLiked[msg.sender][postId] == true) {
            revert FreedomDoves_YouHaveAlreadyLikedThisPost();
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

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = ControllerState.OPEN == s_controllerState;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasWinner = s_storePost[s_topThreePostId[2]].postAuthors !=
            address(0);
        upkeepNeeded = (timePassed && isOpen && hasWinner);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert FreedomDoves__UpkeepNotNeeded();
        }
        s_controllerState = ControllerState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRandomNum(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId*/,
        uint256[] memory randomWords
    ) internal override {
        for (uint8 i = 0; i < 3; i++) {
            if (s_storePost[s_topThreePostId[i]].postAuthors != address(0)) {
                i_fusdc.transfer(
                    s_storePost[s_topThreePostId[i]].postAuthors,
                    (randomWords[i] % 900) + 100
                );
                if (
                    i_adminNFT.balanceOf(
                        s_storePost[s_topThreePostId[i]].postAuthors
                    ) == 0
                ) {
                    i_adminNFT.mintNft(
                        s_storePost[s_topThreePostId[i]].postAuthors
                    );
                }
                s_topThreePostId[i] = 0;
            }
        }
        s_controllerState = ControllerState.OPEN;
        s_lastTimeStamp = block.timestamp;
    }

    function getPostData(uint256 postId) public view returns (PostData memory) {
        return s_storePost[postId];
    }

    function getTotalPost() public view returns (uint256) {
        return s_postIdCounter;
    }

    function getCommentData(
        uint256 postId,
        uint256 commentId
    ) public view returns (CommentData memory) {
        return s_storeComment[postId][commentId];
    }

    function getTotalComment(uint256 postId) public view returns (uint256) {
        return s_commentIdCounter[postId];
    }
}
