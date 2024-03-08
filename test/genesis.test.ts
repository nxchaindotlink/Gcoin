import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Await } from "react-router-dom";

describe("Plural Coin Genesis", function () {

  const TIME = 31 * 24 * 60 * 60;
  const BLOCKTIMESTAMP = Math.floor(Date.now() / 1000);

  async function deployFixture() {


    const [owner, otherAccount] = await ethers.getSigners();

    const Usdt = await ethers.getContractFactory("Usdt");
    const usdt = await Usdt.deploy();

    const Coin = await ethers.getContractFactory("coin");
    const coin = await Coin.deploy();

    const Protocoin = await ethers.getContractFactory("Genesis");
    const protocoin = await Protocoin.deploy(usdt.target);

    return { protocoin, usdt, owner, otherAccount, coin};
  }
  it("Should get Balance", async function () {
    const { protocoin, owner } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    expect(await Instance.balanceOf(owner.address)).to.equal(68022500000000n);

  });


  it("Should get name", async function () {
    const { protocoin, owner } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    expect(await Instance.name()).to.equal("Plural Coin Genesis");

  });


  it("Should get symbol", async function () {
    const { protocoin, owner } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    expect(await Instance.symbol()).to.equal("PLG");

  });


  it("Should get owner", async function () {
    const { protocoin, owner } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    expect(await Instance.owner()).to.equal(owner.address);

  });


  it("Should get decimals", async function () {
    const { protocoin, owner } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    expect(await Instance.decimals()).to.equal(6);

  });

  
  it("Should get priceQuota", async function () {
    const { protocoin} = await loadFixture(deployFixture);
    expect(await protocoin.priceQuota()).to.equal(1000n) 
  });

  it("Should addYield add tokens for income.", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    await Instance.transfer(otherAccount.address, 1000n);

    const InstanceOther = protocoin.connect(otherAccount);
    await InstanceOther.addYield(1000n);

    expect(await InstanceOther.farming(otherAccount.address)).to.equal(1000n);

  });

  it("Should addYield not found tokens for income ", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    await Instance.transfer(otherAccount.address, 100n);

    const InstanceOther = protocoin.connect(otherAccount);

    await expect(InstanceOther.addYield(1000n)).to.be.revertedWith("You need balance for this")

  });


  it("Should addYield ERROR amount has > 0 ", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    await Instance.transfer(otherAccount.address, 100n);

    const InstanceOther = protocoin.connect(otherAccount);

    await expect(InstanceOther.addYield(0n)).to.be.revertedWith("amount require > 0")

  });


  it("Should removeYield ", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    await Instance.transfer(otherAccount.address, 1000n);

    const InstanceOther = protocoin.connect(otherAccount);
    await InstanceOther.addYield(1000n);

    const timeDate = time.increase(31 * 24 * 60 * 60);
    await timeDate;

    await InstanceOther.removeYield(100n);
    expect(await InstanceOther.farming(otherAccount.address)).to.equal(900n);
    expect(await InstanceOther.balanceOf(otherAccount.address)).to.equal(100n);

  });


  it("Should removeYield NOT founds farmings ", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    await Instance.transfer(otherAccount.address, 1000n);

    const InstanceOther = protocoin.connect(otherAccount);
    await InstanceOther.addYield(1000n);

    // Aumentar o tempo para que os tokens estejam disponíveis para retirada
    const timeDate = time.increase(31 * 24 * 60 * 60);
    await timeDate;

    // Chamar a função removeYield com o valor correto
    await expect(InstanceOther.removeYield(2000n)).to.be.revertedWith("You don't have tokens farmings for rewards");

  });

  it("Should removeYield NOT founds farmings ", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const Instance = protocoin.connect(owner);
    await Instance.transfer(otherAccount.address, 1000n);

    const InstanceOther = protocoin.connect(otherAccount);
    await InstanceOther.addYield(1000n);

    // Aumentar o tempo para que os tokens estejam disponíveis para retirada
    const timeDate = time.increase(29 * 24 * 60 * 60);
    await timeDate;

    // Chamar a função removeYield com o valor correto
    await expect(InstanceOther.removeYield(1000n)).to.be.revertedWith("Time lock not expired");

  });


  it("Should deposit ", async function () {
    const { protocoin, owner, otherAccount, usdt } = await loadFixture(deployFixture);


    await usdt.approve(protocoin.target, 1000n);

    expect(await protocoin.deposit(1000n)).to.emit(protocoin, "Deposit")
      .withArgs(owner.address, 1000n, BLOCKTIMESTAMP);
    expect(await protocoin.reserve(usdt.target)).to.equal(1000n);
    expect(await usdt.balanceOf(protocoin.target)).to.equal(1000n);

  });

  it("Should deposit ERROR onlyOwner ", async function () {
    const { protocoin, otherAccount, usdt } = await loadFixture(deployFixture);


    await usdt.approve(protocoin.target, 1000n);
    const Instance = protocoin.connect(otherAccount);
    await expect(Instance.deposit(1000n)).to.be.revertedWith("Only owner permission this function")

  });

  it("Should deposit ERROR < 0 ", async function () {
    const { protocoin, usdt } = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);

    await expect(protocoin.deposit(0n)).to.be.revertedWith("Amount must be greater than 0")


  });

 

  it("Should deposit ERROR approve this contract ", async function () {
    const { protocoin} = await loadFixture(deployFixture);

    await expect(protocoin.deposit(1000n)).to.be.revertedWith("You need to approve this contract to transfer the specified amount of USDT");

  });


  it("Should withdraw ", async function () {
    const { protocoin, owner, usdt } = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);

    expect(await protocoin.withdraw(100n)).to.emit(protocoin, "Withdraw")

      .withArgs(owner.address, 1000n, BLOCKTIMESTAMP)
    expect(await protocoin.reserve(usdt.target)).to.equal(900n);


  });

  it("Should revert if withdraw amount is greater than contract balance", async function () {
    const { protocoin, usdt } = await loadFixture(deployFixture);

    // Deposit some USDT
    const depositAmount = 100n;
    await usdt.approve(protocoin.target, depositAmount);
    await protocoin.deposit(depositAmount);

    // Attempt to withdraw an amount greater than the contract balance
    const withdrawAmount = depositAmount + 100n;
    await expect(protocoin.withdraw(withdrawAmount)).to.be.revertedWith("Insufficient balance in the contract");
  });

  it("Should withdraw < 0 ERROR ", async function () {
    const { protocoin, usdt } = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);

    await expect(protocoin.withdraw(0n)).to.be.revertedWith("Amount must be greater than 0");


  });

  it("Should withdraw ERROR onlyOwner ", async function () {
    const { protocoin, otherAccount, usdt } = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);

    const Instance = protocoin.connect(otherAccount);

    await expect(Instance.withdraw(1000n)).to.be.revertedWith("Only owner permission this function");


  });

  it("Should getTxPerTime 30 days", async function () {
    const { protocoin, otherAccount, usdt } = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000_000_000n);//1k doll
    await protocoin.deposit(1_000_000_000n);//1k dol

    await protocoin.transfer(otherAccount.address, 1_000_000_000n);

    const Instance = protocoin.connect(otherAccount);

    await Instance.addYield(1000_000_000n);

    await time.increase(30 * 24 * 60 * 60);

    await Instance.getTxPerTime();
    
    expect(await usdt.balanceOf(otherAccount.address)).to.equal(1000000n);

    expect(await protocoin.balanceOf(otherAccount.address)).to.equal(0n);

    expect(await usdt.balanceOf(protocoin.target)).to.equal(999000000n);
});


it("Should getTxPerTime 30 days *2", async function () {
  const { protocoin, otherAccount, usdt } = await loadFixture(deployFixture);

  await protocoin.transfer(otherAccount.address, 1000_000_000n);

  await usdt.approve(protocoin.target, 1000_000_000);
  await protocoin.deposit(1000_000_000n);

  const Instance = protocoin.connect(otherAccount);
  await Instance.addYield(1000_000_000n);

  await time.increase(60 *24 *60 *60);

  await Instance.getTxPerTime();

  expect(await usdt.balanceOf(otherAccount.address)).to.equal(2000000n)
});







  it("Should getTxPerTime 12 months", async function () {
    const { protocoin, otherAccount, usdt } = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);

    await protocoin.transfer(otherAccount.address, 1000n);

    const Instance = protocoin.connect(otherAccount);

    await Instance.addYield(1000n);

    await time.increase(360 * 24 * 60 * 60)

    await Instance.getTxPerTime();

    expect(await usdt.balanceOf(otherAccount.address)).to.equal(12n);

  });


  it("Should getTxPerTime ERROR NOT FARMING TOKENS", async function () {
    const { protocoin, otherAccount, usdt } = await loadFixture(deployFixture);
  
    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);
  
    const Instance = protocoin.connect(otherAccount);
  
    // Aguarde o tempo necessário para que a operação de addYield seja possível
    await time.increase(TIME);
  
    await expect(Instance.getTxPerTime()).to.be.revertedWith("You don't have tokens staked for rewards");
  });
  

  it("Should getTxPerTime ERROR time lock not expired", async function () {
    const { protocoin, otherAccount, usdt } = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);

    await protocoin.transfer(otherAccount.address, 1000n);

    const Instance = protocoin.connect(otherAccount);

    await Instance.addYield(1000n);

    await time.increase(TIME - 20 * 24 * 60 * 60);

    await expect(Instance.getTxPerTime()).to.be.revertedWith("Reward claiming period has not passed yet");


  });

  it("Should define owner", async function () {
    const { protocoin, owner, otherAccount, usdt} = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);

    const Owner = protocoin.connect(owner);

    await Owner.defineOwner(otherAccount.address);

    expect(await protocoin.owner()).to.equal(otherAccount.address);
    const other = protocoin.connect(otherAccount);
    await other.withdraw(100n)
    
    expect(await other.reserve(usdt.target)).to.equal(900n);


  });

  it("Should ERROR NOT OWNER", async function () {
    const { protocoin, owner, otherAccount, usdt} = await loadFixture(deployFixture);

    await usdt.approve(protocoin.target, 1000n);
    await protocoin.deposit(1000n);

    const Owner = protocoin.connect(owner);

    await Owner.defineOwner(otherAccount.address);

    expect(await protocoin.owner()).to.equal(otherAccount.address);
    const OwnerTwo = protocoin.connect(owner);
    await expect(OwnerTwo.withdraw(100n)).to.be.revertedWith("Only owner permission this function")
    
  });

  it("Should Only owner define", async function () {
    const { protocoin, otherAccount } = await loadFixture(deployFixture);

    const other = protocoin.connect(otherAccount);


    await expect(other.defineOwner(otherAccount.address)).to.be.revertedWith("Only owner permission this function");
  });


  it("Should define new payment method", async function () {
    const { protocoin, otherAccount, coin } = await loadFixture(deployFixture);

    await protocoin.defineMethodPayment(coin.target);
    expect(await protocoin.usdtAddress()).to.equal(coin.target)

    await coin.approve(protocoin.target, 1000n);

    await protocoin.deposit(1000n);
    expect(await protocoin.reserve(coin.target)).to.equal(1000n);


    
  });


  it("Should define new token ONLYOWNER", async function () {
    const { protocoin, otherAccount, coin } = await loadFixture(deployFixture);

    const Other = protocoin.connect(otherAccount);
    await expect(Other.defineMethodPayment(coin.target)).to.be.revertedWith("Only owner permission this function")
  });

  it("Should buy", async function () {
    const { protocoin, otherAccount, usdt, owner } = await loadFixture(deployFixture);
    
    // Transferir USDT para otherAccount
    await usdt.transfer(otherAccount.address, 1000000000n);
    
    // Aprovar o contrato protocoin a gastar USDT em nome de otherAccount
    const OtherUsdt = usdt.connect(otherAccount);
    await OtherUsdt.approve(protocoin.target, 1000000000n);

    // Obter o saldo do owner antes da compra
    const balanceBefore = await protocoin.balanceOf(owner);

    // Chamar a função buy
    const Other = protocoin.connect(otherAccount);
    await Other.buy(1000000000n);

    // Verificar os saldos após a compra
    expect(await usdt.balanceOf(protocoin.target)).to.equal(1000000000n);
    expect(await protocoin.balanceOf(otherAccount.address)).to.equal(10000_000_000n);

    // Verificar se o saldo do owner diminuiu
    const balanceAfter = await protocoin.balanceOf(owner);
    expect(balanceAfter).to.equal(balanceBefore - 10000000000n * 1n);
});

it("Should NOT balance otheracoount buy", async function () {
  const { protocoin, otherAccount, usdt, owner } = await loadFixture(deployFixture);
  
  // Transferir USDT para otherAccount
  await usdt.transfer(otherAccount.address, 1000000000n);
  
  // Aprovar o contrato protocoin a gastar USDT em nome de otherAccount
  const OtherUsdt = usdt.connect(otherAccount);
  await OtherUsdt.approve(protocoin.target, 1000000000n);

  const Other = protocoin.connect(otherAccount);

  await expect(Other.buy(10000000000000)).to.be.revertedWith("You need balance")
});


it("Should NOT balance owner for buy", async function () {
  const { protocoin, otherAccount, usdt, owner } = await loadFixture(deployFixture);
  
  // Transferir USDT para otherAccount
  await usdt.transfer(otherAccount.address, 1000000000n);
  
  // Aprovar o contrato protocoin a gastar USDT em nome de otherAccount
  const OtherUsdt = usdt.connect(otherAccount);
  await OtherUsdt.approve(protocoin.target, 1000_000_000n);

  const Other = protocoin.connect(otherAccount);


  const BALANCE = await protocoin.balanceOf(owner);

  await protocoin.transfer(usdt.target, BALANCE);

  await expect(Other.buy(1000_000_000n)).to.be.revertedWith("NOT found for this transaction")
});


it("Should NOT balance owner for buy", async function () {
  const { protocoin, otherAccount, usdt, owner } = await loadFixture(deployFixture);
  
  expect(await protocoin.getOwner()).to.equal(owner);
});


});

