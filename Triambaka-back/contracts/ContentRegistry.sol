// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContentRegistry {
    struct Content {
        address owner;
        string ipfsHash;
        string sha256Hash;
        uint timestamp;
        uint delta;
    }

    mapping(string => Content) private contentByHash; // Maps SHA256 hash to content
    mapping(address => string[]) private ownerToHashes; // Maps owner to their content hashes

    event ContentRegistered(
        address indexed owner,
        string ipfsHash,
        string sha256Hash,
        uint timestamp,
        uint delta
    );

    event ContentExists(
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
    ) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_sha256Hash).length > 0, "SHA256 hash cannot be empty");

        // Check if the content already exists
        if (bytes(contentByHash[_sha256Hash].sha256Hash).length != 0) {
            Content memory existingContent = contentByHash[_sha256Hash];
            emit ContentExists(
                existingContent.owner,
                existingContent.ipfsHash,
                existingContent.sha256Hash,
                existingContent.timestamp,
                existingContent.delta
            );
            return;
        }

        // Register new content
        contentByHash[_sha256Hash] = Content(
            msg.sender,
            _ipfsHash,
            _sha256Hash,
            block.timestamp,
            _delta
        );
        ownerToHashes[msg.sender].push(_sha256Hash);

        emit ContentRegistered(
            msg.sender,
            _ipfsHash,
            _sha256Hash,
            block.timestamp,
            _delta
        );
    }

    // Retrieve content details by SHA256 hash
    function getContentByHash(
        string memory _sha256Hash
    ) public view returns (address, string memory, string memory, uint, uint) {
        require(
            bytes(contentByHash[_sha256Hash].sha256Hash).length != 0,
            "Content not found"
        );

        Content memory content = contentByHash[_sha256Hash];
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
        string memory _sha256Hash,
        address _claimedOwner
    ) public view returns (bool) {
        return contentByHash[_sha256Hash].owner == _claimedOwner;
    }

    // Retrieve all hashes registered by a specific user
    function getUserContents(
        address _user
    ) public view returns (string[] memory) {
        return ownerToHashes[_user];
    }

    // Check if an image already exists using its SHA256 hash
    function checkImageExists(
        string memory _sha256Hash
    ) public view returns (bool) {
        return bytes(contentByHash[_sha256Hash].sha256Hash).length != 0;
    }
}
