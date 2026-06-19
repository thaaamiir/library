class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def increment(self, amount):
        self.salary += amount

e = Employee("John", 50000)

e.increment(50000)

print(e.salary)