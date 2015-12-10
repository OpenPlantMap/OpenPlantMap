<img src="https://raw.githubusercontent.com/OpenPlantMap/OpenPlantMap/master/images/Logo.png" width="450">
============
This is the front-end for OpenPlantMap.

OpenPlantMap is based on [OpenSenseMap](https://github.com/sensebox/OpenSenseMap). 

OpenPlantMap is created within the course "SenseBox for People-Centered Urban Planning" at the Institute for Geoinformatics (WWU Münster).
###Installation instructions

The installation steps are the same like the of OpenSenseMap. The following instructions are copied from the README file of this project.
#### Installation

Go to the cloned repository and run

```
npm install
bower install
```

Now you are good to go and start up the server

```
grunt serve
```

Alternatively, you can use a webserver like nginx and point the web root to the /app folder:

```
server {
        root /var/www/OpenSenseMap/app;
        index index.html;
        location / {
                try_files $uri $uri/ /index.html;
        }

}
```

Code license: MIT License
