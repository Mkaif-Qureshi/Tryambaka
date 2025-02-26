// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContentRegistry {
    struct Content {
        address owner;
        string ipfsHash;
        string sha256Hash;
        uint timestamp;
        uint delta; // Added delta value
    }

    mapping(uint => Content) public contents;
    mapping(string => uint) private hashToContentId; // Maps sha256Hash to content ID
    mapping(address => uint[]) private ownerToContentIds; // Maps owner address to content IDs
    uint public contentCount;

    event ContentRegistered(
        uint contentId,
        address indexed owner,
        string ipfsHash,
        string sha256Hash,
        uint timestamp,
        uint delta
    );
    event ContentExists(
        uint contentId,
        address indexed owner,
        string ipfsHash,
        string sha256Hash,
        uint timestamp,
        uint delta
    );

    // Register new content with IPFS hash, SHA256 hash, and delta value
    function registerContent(
        string memory _ipfsHash,
        string memory _sha256Hash,
        uint _delta
    ) public returns (uint) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_sha256Hash).length > 0, "SHA256 hash cannot be empty");

        uint existingContentId = hashToContentId[_sha256Hash];

        // If content already exists, return its details
        if (existingContentId != 0) {
            Content memory existingContent = contents[existingContentId];
            emit ContentExists(
                existingContentId,
                existingContent.owner,
                existingContent.ipfsHash,
                existingContent.sha256Hash,
                existingContent.timestamp,
                existingContent.delta
            );
            return existingContentId;
        }

        // Register new content
        contentCount++;
        contents[contentCount] = Content(
            msg.sender,
            _ipfsHash,
            _sha256Hash,
            block.timestamp,
            _delta
        );
        hashToContentId[_sha256Hash] = contentCount;
        ownerToContentIds[msg.sender].push(contentCount);
        emit ContentRegistered(
            contentCount,
            msg.sender,
            _ipfsHash,
            _sha256Hash,
            block.timestamp,
            _delta
        );
        return contentCount;
    }

    // Retrieve content details
    function getContent(
        uint _contentId
    ) public view returns (address, string memory, string memory, uint, uint) {
        require(
            _contentId > 0 && _contentId <= contentCount,
            "Content ID does not exist"
        );
        Content memory content = contents[_contentId];
        return (
            content.owner,
            content.ipfsHash,
            content.sha256Hash,
            content.timestamp,
            content.delta
        );
    }

    // Verify ownership of content
    function verifyOwnership(
        uint _contentId,
        address _claimedOwner
    ) public view returns (bool) {
        require(
            _contentId > 0 && _contentId <= contentCount,
            "Content ID does not exist"
        );
        return contents[_contentId].owner == _claimedOwner;
    }

    // Retrieve all content IDs registered by a specific user
    function getUserContents(
        address _user
    ) public view returns (uint[] memory) {
        return ownerToContentIds[_user];
    }

    // Check if an image already exists using its SHA256 hash
    function checkImageExists(
        string memory _sha256Hash
    ) public view returns (bool) {
        return hashToContentId[_sha256Hash] != 0;
    }
}
