// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ISignatureTransfer} from "./interfaces/ISignatureTransfer.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PermitSignatureGSN is ERC2771Recipient, Ownable  {
    ISignatureTransfer public immutable PERMIT2;

    constructor(ISignatureTransfer _permit, address forwarder) {
        PERMIT2 = _permit;
        _setTrustedForwarder(forwarder);
    }

    ISignatureTransfer.SignatureTransferDetails[] internal SignatureTransferDetails;

    function transfer(
        uint256[] memory _amount,
        address[] memory _token,
        address[] memory _recipient,
        address _owner,
        ISignatureTransfer.PermitBatchTransferFrom calldata _permit,
        bytes calldata _signature
    ) external {
        delete SignatureTransferDetails;

        for (uint i = 0; i < _token.length; i++) {
            ISignatureTransfer.SignatureTransferDetails storage SignatureTransferDetail = SignatureTransferDetails.push();
            SignatureTransferDetail.to = _recipient[i];
            SignatureTransferDetail.requestedAmount = _amount[i];
        }

        PERMIT2.permitTransferFrom(
            _permit,
            SignatureTransferDetails,
            _owner,
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