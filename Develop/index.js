const fs = require("fs");
const util = require("util");
const path = require("path");
const inquirer = require("inquirer");
const axios = require("axios");
require("dotenv").config();
const generateHTML = require("./GenerateHTML");
const convertFactory = require("electron-html-to");
const open = require('open');


inquirer
  .prompt(
    [{
      type: "input",
      message: "What is the Github username?",
      name: "username"
    },
    {
      type: "list",
      message: "What is your favorite color",
      name: "color",
      choices: [
        "red",
        "blue",
        "green",
        "pink"
      ]

    }]
  )
  .then(function (answers) {
    const { username, color } = answers;
    console.log(username, color);

    const queryUrl = `https://api.github.com/users/${username}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
    axios.get(queryUrl)

      .then(function (res) {
        axios
          .get(`https://api.github.com/users/${username}/repos?client_id=${
            process.env.CLIENT_ID
            }&client_secret=${process.env.CLIENT_SECRET}&per_page=100`)
          .then(function (starResults) {
            let starTotal = 0;
           console.log(starResults.data);
            starResults.data.forEach(repo => {
              starTotal += repo.stargazers_count;
            });

            const userData = {
              profileImage: res.data.avatar_url,
              userName: res.data.name,
              userLocation: res.data.location,
              userGithub: res.data.html_url,
              userBlog: res.data.blog,
              userBio: res.data.bio,
              numRepo: res.data.public_repos,
              numFollowers: res.data.followers,
              numUserFollowing: res.data.following,
              stars: starTotal,
              color: color
            }
            console.log(userData);
            return generateHTML(userData);
            }).then(function (generatedHTML) {
            fs.writeFile("resume.html", html, function (err) {
            if(err) {
            return console.log(err);
            }
            console.log("success!")
            })

            var conversion = convertFactory({
              converterPath: convertFactory.converters.PDF
            });
             
            conversion({ html: generatedHTML}, function(err, result) {
              if (err) {
                return console.error(err);
              }
             
              result.stream.pipe(fs.createWriteStream('/path/to/anywhere.pdf'));
              //result.stream.pipe(fs.createWriteStream(path.join("./profile.pdf")));

              conversion.kill();
          });

      });
  });
});