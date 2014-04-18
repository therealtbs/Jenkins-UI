Jenkins-UI
==========
See it in action here: http://builds.therealtbs.me/
Setup
----------
Unfortunately this does not work with Jenkins out-of-the-box.
Here are the steps you need to take in order to make this work.
1. Apply CORS-Headers
2. (if downloading from an external source (eg. CDN)) add artifact information to the build description


### 1. Apply CORS-Headers
If you are using a reverse proxy such as nginx or Apache with mod_proxy you should be able to just add the headers in the appropriate config file.
See http://enable-cors.org/server.html on how to do that with your server.

If you are not using a reverse proxy you are on your own.
Seriously though, it takes 5 minutes to set up nginx as reverse proxy for Jenkins and it makes things waaay easier.

There are plugins for Jenkins to add that functionality but you will have to find out how to use them by yourself.

### 2. Artifact Information
For that I use a modified version of the description setter plugin that sets the build description based from a file ([download](http://builds.therealtbs.me/build-description-setter.hpi)) and [ArMaGen](https://github.com/therealtbs/ArMaGen) to generate the description.
