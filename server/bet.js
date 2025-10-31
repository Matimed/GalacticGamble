export class Bet {
    constructor(user, amount, cashOut) {
      this.user = user;
      this.amount = amount;
      this.cashOut = cashOut;
      this.profit = null;
    }

    toJSONAdmin() {
        return {
          user: this.user,
          amount: this.getAmount(),
          cashOut: this.getCashOut(),
        };
    }

    toJSONPreGame() {
        return {
          user: this.user,
          amount: this.getAmount(),
        };
    }

    toJSONInGame() {
        return {
          user: this.user,
          profit: this.getProfit(),
          cashOut: this.profit?this.getCashOut():'',
        };
    }

    getProfit() {return this.profit ? '+$' + Number(this.profit).toFixed(2) : ''}
    getAmount() {return this.amount ? '$' + Number(this.amount).toFixed(2) : ''}
    getCashOut() {return this.cashOut ? Number(this.cashOut).toFixed(2) + 'x' : ''}


}