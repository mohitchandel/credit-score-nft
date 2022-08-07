// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CreditCertificate is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    event Attest(address indexed to, uint256 indexed tokenId);
    event Revoke(address indexed to, uint256 indexed tokenId);

    struct Lock {
        address holder;
        uint256 amount;
        uint256 tokenId;
        string tokenUrI;
        string name;
        string description;
    }
    mapping(address => Lock) public locked;

    receive() external payable {}

    constructor() ERC721("Credit Burea Certificate", "CBCT") {}

    function safeMint(
        address to,
        string memory uri,
        uint256 _tokenId
    ) internal {
        _safeMint(to, _tokenId);
        _setTokenURI(_tokenId, uri);
    }

    function lockFunds(uint256 _amount, string memory _tokenUri, string memory _name, string memory _desc)
        external
        payable
    {
        require(locked[msg.sender].holder == address(0), "already Locked");
        require(_amount == msg.value);
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        locked[msg.sender] = Lock(msg.sender, (_amount / 1 ether), tokenId, _tokenUri, _name, _desc);
        safeMint(msg.sender, _tokenUri, tokenId);
    }

    function unLock(address _beneficiary) external payable {
        require(msg.sender == _beneficiary, "Only owner can unlock");
        require(
            locked[_beneficiary].holder == _beneficiary,
            "You don't have any token Locked"
        );
        address payable holder = payable(_beneficiary);
        holder.transfer((locked[_beneficiary].amount)*(10**18));
        burn(locked[_beneficiary].tokenId);
        delete locked[_beneficiary];
    }

    function burn(uint256 tokenId) internal {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only owner of the certificate can burn it"
        );
        _burn(tokenId);
    }

    function getLockData(address _holder) public view returns (Lock memory) {
        return locked[_holder];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256
    ) internal pure override {
        require(
            from == address(0) || to == address(0),
            "Not allowed to transfer certificate"
        );
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if (from == address(0)) {
            emit Attest(to, tokenId);
        } else if (to == address(0)) {
            emit Revoke(to, tokenId);
        }
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
