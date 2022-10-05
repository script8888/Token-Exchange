// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public wstTokenAddress;

    constructor(address WST_TOKEN) ERC20("WST Lp Token", "WSTLP") {
        require(WST_TOKEN != address(0), "Token address is a null");
        wstTokenAddress = WST_TOKEN;
    }

    function getReserve() public view returns (uint) {
        return ERC20(wstTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint wstTokenReserve = getReserve();
        ERC20 wstToken = ERC20(wstTokenAddress);

        if (wstTokenReserve == 0) {
            wstToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            uint ethReserve = ethBalance - msg.value;
            uint wstTokenAmount = (msg.value * wstTokenReserve) / (ethReserve);
            require(
                _amount >= wstTokenAmount,
                "Amount of tokens sent is less than the minimum tokens required"
            );
            wstToken.transferFrom(msg.sender, address(this), wstTokenAmount);
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns (uint, uint) {
        require(_amount > 0, "Amount should be greater than zero");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (ethReserve * _amount) / _totalSupply;

        uint wstTokenAmount = (getReserve() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);

        payable(msg.sender).transfer(ethAmount);
        ERC20(wstTokenAddress).transfer(msg.sender, wstTokenAmount);
        return (ethAmount, wstTokenAmount);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid reserve");
        uint256 inputAmountWithFee = inputAmount * 99;

        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function ethToWstToken(uint _minTokens) public payable {
        uint256 tokenReserve = getReserve();

        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );

        require(tokensBought >= _minTokens, "insufficient amount");
        ERC20(wstTokenAddress).transfer(msg.sender, tokensBought);
    }

    function wstTokenToEth(uint _tokensSold, uint _minEth) public payable {
        uint256 tokenReserve = getReserve();

        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "Insufficient amount");

        ERC20(wstTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        payable(msg.sender).transfer(ethBought);
    }
}
