'use strict';

const fs = require('fs');
const https = require('https');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', function (inputStdin) {
    inputString += inputStdin;
});

process.stdin.on('end', function () {
    inputString = inputString.split('\n');
    main();
});

function readLine() {
    return inputString[currentLine++];
}

async function fetchGoals(team, year, teamType) {
    let totalGoals = 0;
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const url = `https://jsonmock.hackerrank.com/api/football_matches?year=${year}&${teamType}=${team}&page=${page}`;
        
        await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    const jsonResponse = JSON.parse(data);
                    totalPages = jsonResponse.total_pages;

                    jsonResponse.data.forEach(match => {
                        if (teamType === 'team1') {
                            totalGoals += parseInt(match.team1goals, 10);
                        } else if (teamType === 'team2') {
                            totalGoals += parseInt(match.team2goals, 10);
                        }
                    });

                    resolve();
                });
            }).on('error', (e) => {
                reject(e);
            });
        });

        page++;
    }

    return totalGoals;
}

async function getTotalGoals(team, year) {
    const team1Goals = await fetchGoals(team, year, 'team1');
    const team2Goals = await fetchGoals(team, year, 'team2');

    return team1Goals + team2Goals;
}

async function main() {
    const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

    const team = readLine().trim();
    const year = parseInt(readLine().trim(), 10);

    const result = await getTotalGoals(team, year);

    ws.write(result + '\n');
    ws.end();
}
