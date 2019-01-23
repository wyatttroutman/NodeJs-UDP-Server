# Node.js UDP Server
This basic Proof of Concept Website uses Node.js to implement a UDP server and clients(s) on a single server. Includes UDP Echo and CBR modes.

## Installation
The easiest way to use this application is on a single Linux server. For the purposes of this project, you should clone this git repository to a Ubuntu Server with Node.js, a webserver, and a modern browser installed. 

## Usage
To run the project on a single server, you can open two terminals. Navigate to the Node.js server files in both terminals. On one termail, start the `server_base.js` file. On the other terminal, start the `client_base.js` file. 

Due to the local connection, you should not have any trouble communicating between terminals. Now, navigate to your webserver's address to load the client-side html. You can use the tools on the web page to change UDP modes and settings. 

After configuring the client, you can watch the exchange of packets and various statistics between the server and client in the two terminals that were previously opened.

## Notes
As is, there is no real functionality to this project. It was only made as part of a set of educational exercises that I regularly do to maintain my seldom used technical skills.

## Liability
This repository is provided as is. I make no representations or warranties of any kind for this repository. I will not be liable for any damages you may suffer in connection with using, modifying, or distributing this software. This software was written for Proof of Concept purposes only.

Originally created in 2017.