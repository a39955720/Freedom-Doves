// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AdminNFT} from "./AdminNFT.sol";

error FreedomDoves__UpkeepNotNeeded();
error FreedomDoves_YouHaveAlreadyLikedThisPost();

contract FreedomDoves is AutomationCompatibleInterface {
    struct PostData {
        bytes title;
        bytes content;
        address postAuthors;
        uint256 numberOfLikes;
    }

    struct CommentData {
        bytes content;
        address commentAuthors;
    }

    IERC20 private immutable i_fusdc;
    AdminNFT private immutable i_adminNFT;
    uint256 private immutable i_interval;
    uint256[3] private i_bonus;

    uint256 private s_lastTimeStamp;
    uint256 private s_postIdCounter;
    uint256[] private s_topThreePostId = new uint256[](3);

    mapping(uint256 => uint256) private s_commentIdCounter;
    mapping(uint256 => PostData) private s_storePost;
    mapping(uint256 => mapping(uint256 => CommentData)) private s_storeComment;
    mapping(address => mapping(uint256 => bool)) private s_isLiked;
    mapping(uint256 => uint256) private s_numberOfLikesThisWeek;

    constructor(
        uint256 updateInterval,
        address fusdcAddr,
        address adminNFTAddr
    ) {
        i_fusdc = IERC20(fusdcAddr);
        i_adminNFT = AdminNFT(adminNFTAddr);
        i_interval = updateInterval;
        i_bonus = [3000, 2000, 1000]; //3000,2000,1000 USDC
        s_lastTimeStamp = block.timestamp;
        s_postIdCounter = 1;
    }

    function newPost(bytes memory _title, bytes memory _content) public {
        s_storePost[s_postIdCounter] = PostData(
            _title,
            _content,
            msg.sender,
            0
        );
        s_postIdCounter++;
    }

    function newComment(uint256 postId, bytes memory _content) public {
        uint256 commentId = s_commentIdCounter[postId];
        s_storeComment[postId][commentId] = CommentData(_content, msg.sender);
        s_commentIdCounter[postId]++;
    }

    function like(uint256 postId) public {
        if (s_isLiked[msg.sender][postId] == true) {
            revert FreedomDoves_YouHaveAlreadyLikedThisPost();
        }
        s_isLiked[msg.sender][postId] = true;
        s_storePost[postId].numberOfLikes++;
        s_numberOfLikesThisWeek[postId]++;
        for (uint8 i = 0; i < 3; i++) {
            if (
                s_numberOfLikesThisWeek[postId] >
                s_numberOfLikesThisWeek[s_topThreePostId[i]]
            ) {
                s_topThreePostId[i] = postId;
                break;
            }
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
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        upkeepNeeded = (timePassed);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert FreedomDoves__UpkeepNotNeeded();
        }
        for (uint8 i = 0; i < 3; i++) {
            if (s_storePost[s_topThreePostId[i]].postAuthors != address(0)) {
                i_fusdc.transfer(
                    s_storePost[s_topThreePostId[i]].postAuthors,
                    i_bonus[i] * 10 ** 6
                );
                i_adminNFT.mintNft(
                    s_storePost[s_topThreePostId[i]].postAuthors
                );
                s_topThreePostId[i] = 0;
            }
        }
        s_lastTimeStamp = block.timestamp;
    }

    function getPostData(uint256 postId) public view returns (PostData memory) {
        return s_storePost[postId];
    }

    function getPostAmount() public view returns (uint256) {
        return s_postIdCounter;
    }

    function getCommentData(
        uint256 postId,
        uint256 commentId
    ) public view returns (CommentData memory) {
        return s_storeComment[postId][commentId];
    }

    function getCommentAmount(uint256 postId) public view returns (uint256) {
        return s_commentIdCounter[postId];
    }
}
