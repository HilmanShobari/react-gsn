// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ISignatureTransfer} from "./interfaces/ISignatureTransfer.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PermitSignatureGSN is ERC2771Recipient, Ownable  {
    string public yangPunya = "Hilman";

    string private constant WITNESS_TYPE_STRING = "Witness witness)TokenPermissions(address token,uint256 amount)Witness(address user)";
    bytes32 private constant WITNESS_TYPEHASH = keccak256("Witness(address user)");

    struct Witness {
        // Address of the user that signer is giving the tokens to
        address user;
    }

    ISignatureTransfer public immutable PERMIT2;

    constructor(ISignatureTransfer _permit, address forwarder) {
        PERMIT2 = _permit;
        _setTrustedForwarder(forwarder);
    }

    mapping (address => mapping (address => uint256)) public tokenBalancesByUser;

    function deposit(
        uint256 _amount,
        address _token,
        address _owner,
        address _user,
        ISignatureTransfer.PermitTransferFrom calldata _permit,
        bytes calldata _signature
    ) external {
        tokenBalancesByUser[_user][_token] += _amount;

        address Acc2 = 0xE5B78452B963Ee246c7043ecEb378367d2b0b862;

        PERMIT2.permitWitnessTransferFrom(
            _permit,
            ISignatureTransfer.SignatureTransferDetails({
                to: Acc2,
                requestedAmount: _amount
            }),
            _owner,
            // witness
            keccak256(abi.encode(WITNESS_TYPEHASH,Witness(_user))),
            // witnessTypeString,
            WITNESS_TYPE_STRING,
            _signature
        );
    }

    function _msgSender() internal view override(Context, ERC2771Recipient)
        returns (address sender) {
        sender = ERC2771Recipient._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Recipient)
        returns (bytes calldata) {
        return ERC2771Recipient._msgData();
    }
}