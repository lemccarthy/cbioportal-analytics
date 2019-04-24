import * as express from "express";
import * as bodyParser from "body-parser";
import * as querystring from "querystring";
import * as url from "url";
import { isArray } from "util";
import getData from "./googleAnalytics";

const server = express();
const port = process.env.PORT || 1337;

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.get("/", async (req, res, next) => {
    try {
        const parsedURL = url.parse(req.url);
        if (parsedURL.query) {
            const parameters = querystring.parse(parsedURL.query);
            console.log(`Queried study: ${parameters.studyId}`);
            if (!isArray(parameters.studyId)) {
                const response = await getData(parameters.studyId);
                res.json(response);
            }
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
