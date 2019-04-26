import { google, analytics_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import * as googleServiceAccountKey from "./keyfile.json";

export interface IAnalyticsResponse {
    totalUses: number;
    totalUniqueUses: number;
    timesVisited: number;
    timesUniqueVisited: number;
}

const viewId = process.env.VIEW_ID || 0;
const scopes = "https://www.googleapis.com/auth/analytics.readonly";
const jwt = new google.auth.JWT(
    googleServiceAccountKey.client_email,
    undefined,
    googleServiceAccountKey.private_key,
    [scopes]
);
const baseOptions = {
    auth: jwt,
    ids: "ga:" + viewId,
    "start-date": "30daysAgo",
    "end-date": "today",
    metrics: "ga:uniqueEvents,ga:totalEvents",
    filters: ""
};
const eventKeys = ["ga:uniqueEvents", "ga:totalEvents"];

const checkNullReturn = (
    key: string,
    queryResponse: GaxiosResponse<analytics_v3.Schema$GaData>
) => {
    return queryResponse &&
        queryResponse.data.totalsForAllResults &&
        key in queryResponse.data.totalsForAllResults
        ? queryResponse.data.totalsForAllResults[key]
        : null;
};

const getTotals = (
    queryResponse: GaxiosResponse<analytics_v3.Schema$GaData>
): { total: string | null; unique: string | null } => {
    const totalVisitedUnique: string | null = checkNullReturn(
        "ga:uniqueEvents",
        queryResponse
    );
    const totalVisited: string | null = checkNullReturn(
        "ga:totalEvents",
        queryResponse
    );
    return {
        unique: totalVisitedUnique,
        total: totalVisited
    };
};

export default async function getData(
    studyName: string
): Promise<IAnalyticsResponse> {
    await jwt.authorize();

    baseOptions[
        "filters"
    ] = `ga:eventCategory==studyPage;ga:eventAction==studyPageLoad;ga:eventLabel==${studyName}\\,`;
    const studyPageLoad = await google.analytics("v3").data.ga.get(baseOptions);

    baseOptions[
        "filters"
    ] = `ga:eventAction==submitQuery;ga:eventLabel==${studyName}\\,`;
    const query = await google.analytics("v3").data.ga.get(baseOptions);

    const { unique: uniqueVisits, total: totalVisits } = getTotals(
        studyPageLoad
    );
    const { unique: totalUniqueUses, total: totalUses } = getTotals(query);

    if (!uniqueVisits || !totalVisits || !totalUniqueUses || !totalUses) {
        throw new Error("400: One of the metrics returned null.");
    }
    return {
        timesVisited: parseInt(uniqueVisits),
        timesUniqueVisited: parseInt(totalVisits),
        totalUses: parseInt(totalUses),
        totalUniqueUses: parseInt(totalUniqueUses)
    };
}
