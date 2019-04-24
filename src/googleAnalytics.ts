import { google } from "googleapis";
import { GaxiosResponse } from "gaxios";

const viewId = process.env.VIEW_ID || 34065145;
const scopes = "https://www.googleapis.com/auth/analytics.readonly";
const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, "", process.env.PRIVATE_KEY, scopes);

export default async function getData(studyName: string): Promise<GaxiosResponse> {
    const response = await jwt.authorize();
    return await google.analytics("v3").data.ga.get({
        auth: jwt,
        ids: "ga:" + viewId,
        "start-date": "30daysAgo",
        "end-date": "today",
        metrics: "ga:uniqueEvents,ga:totalEvents",
        filters: `ga:eventAction==query,ga:eventLabel==${studyName}`
    });
}
