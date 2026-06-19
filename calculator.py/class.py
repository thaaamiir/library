class bank:
    def __init__(self,balance):
        self.balance=balance
    def deposit(self,amount):
        self.balance+=amount
        print("deposit=",self.balance)
    def withdraw(self,amount):
        self.balance-=amount
        print("withdraw=",self.balance)
    def final_balance(self):
        print("final balance=",self.balance)
    
account=bank(5000)
account.deposit(1000)
account.withdraw(2000)
account.final_balance()