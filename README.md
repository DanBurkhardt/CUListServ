# CUListServ
An open-source solution for extracting your club's entire listserv for migration or archival.

## Purpose
This application is intended for listerv admins to ease with the transition to a third party listserv like MailChimp or the like. A lot of clubs are migrating away from a CUIT hosted listerv, this tool enables you to automate that process.

## Dependencies
Needless to say, you should be familiar with IDEs, NodeJS and have all the tools to run this program. 

You will need to have Node and NPM installed on your machine and the following dependencies via NPM:
- NPM install async
- NPM install request

## Running the program
You will need to edit the following lines:

- “userCookie” -Your authentication token. You get this by using FireBug or another inspector to see what your auth token looks like. When you authenticate initially, simply have firebug open and copy the auth toke that it returns. 
NOTE: This is only the first line. It should say something like “listName+admin=10982109180821********” 
You can’t automate without this token.

- “listName” —The name of the listserv


## Notes
- Yes, I realize this codebase is a mess. I only just discovered asynchronous processing with Node and this was my first implementation of it. Given that, please be merciful
- I tried to document in the body and be as descriptive as I felt was useful, but this was not for a class assignment so it does not adhere to any sort of standard. Feel free to clean it up if you’d like
- I did not implement any type of object oriented approach simply because I am not that comfortable with it at this time. Tons of things in here could be made much more readable with an implementation like that, but I was just blowing through it.
-I didn’t really do a lot of error handling. You will have to uncomment some stuff if it is going wrong but I ASSURE YOU, if you just put the list name and your token in properly, as of Sept 9, it should work fine.

Feel free to fork it and make it your own, but you must credit me and link back to the original work on GitHub.
