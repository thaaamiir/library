library=[]
while True:
    print("__Library Management__")
    print("1.Add Book")
    print("2.View All Book")
    print("3.Search Book")
    print("4.Borrow Book")
    print("5.Return Book")
    print("6.Delete Book")
    print("7.Save To File")
    print("8.Load From File")
    print("9.Exit")
    choice=int(input("Enter Your Choice:"))
    if choice==1:
        book = {
            "title": input("Book Title: "),
            "author": input("Author: "),
            "available":True
        }
        library.append(book)
        print("BOOK ADDED")

    elif choice==2:
        if len(library)==0:
            print("NO BOOK AVAILABLE")
        else:
            for book in library:
                print(book)
    
    elif choice == 3:

        search_name = input("Enter Book Name To Search: ")
        found = False

        for book in library:
            if book["title"].lower() == search_name.lower():
                print("BOOK!")
                print(book)
                found = True
                break
        if not found:
            print("BOOK NOT FOUND.")

    elif choice==4:
        borrow=input("Enter The Book To Borrow:")
        for book in library:
            if book["title"]==borrow:
                if book["available"]:
                    book["available"] = False
                    print("BOOK BORROWED SUCCESSFULLY!")
                else:
                    print("BOOK ALREADY BORROWED!")
                break
        else:
            print("BOOK NOT FOUND.")

    elif choice==5:
        return_book=input("Enter The Book To Be Returned:")
        for book in library:
            if book["title"]==return_book:
                book["available"]=True
                print("BOOK RETURNED SUCCESSFULLY")
                break
            else:
                print("BOOK NOT FOUND")

    elif choice==6:
        delete=input("Enter The Book To Be Deleted:")
        for book in library:
            if book["title"]==delete:
                library.remove(book)
                print("BOOK DELETED SUCCESSFULLY!")
                break
            else:
                print("BOOK NOT FOUND")

    elif choice==7:
        file = open("lib.txt", "w")
        file.write(str(library))
        file.close()
        print("DATA SAVED SUCCESSFULLY!")

    elif choice==8:
        try:
            file = open("lib.txt", "r")
            data = file.read()
            library = eval(data)
            file.close()
            print("DATA LOADED SUCCESSFULLY!")
        except:
            print("NO SAVED FILE FOUND.")

    elif choice==9:
        print("THANK YOU!")
        break
    else:
        print("INVALID CHOICEEEE!")





