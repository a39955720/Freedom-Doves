// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

error FreedomDoves__UpkeepNotNeeded();

contract FreedomDoves is AutomationCompatibleInterface {
    struct PostsData {
        bytes title;
        bytes content;
        address postAuthors;
        uint256 numberOfLikes;
    }

    struct CommentsData {
        bytes content;
        address commentAuthors;
    }

    uint256 private immutable i_interval;

    uint256 private s_lastTimeStamp;
    uint256 private s_postIdCounter;

    mapping(uint256 => uint256) private s_commentIdCounter;
    mapping(uint256 => PostsData) private s_storePost;
    mapping(uint256 => mapping(uint256 => CommentsData)) private s_storeComment;

    constructor(uint256 updateInterval) {
        i_interval = updateInterval;
        s_lastTimeStamp = block.timestamp;
        s_postIdCounter = 0;
    }

    function newPost(bytes memory _title, bytes memory _content) public {
        s_storePost[s_postIdCounter] = PostsData(
            _title,
            _content,
            msg.sender,
            0
        );
        s_postIdCounter++;
    }

    function newComment(uint256 postId, bytes memory _content) public {
        uint256 commentId = s_commentIdCounter[postId];
        s_storeComment[postId][commentId] = CommentsData(_content, msg.sender);
        s_commentIdCounter[postId]++;
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
        s_lastTimeStamp = block.timestamp;
    }
}
