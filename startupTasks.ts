import { url } from "inspector";
import Rand from "rand-seed";
import {RNG} from "./hashing/RNG";


export function randomTimeRange(range: string, frequency: number) {
	// First we need to parse the string, so we split it into it's constituent parts
	let [start, end] = range.split("-");
	// then we need to break the start and end into their hours and minutes
	let [startHour, startMinute] = start.split(":");
	let [endHour, endMinute] = end.split(":");
	// get the current time in hours and minutes

	let now = new Date();
	//
	// if the current time is before the start time, we need to set the current time to the start time
	// check if we're before the endtime, makes no sense to update the time if we're after the end time
	// Now that we have our start time, we need to get a random time between the start and end time
	// do do this, since we have our times as strings,make them integers
	let startTime = [parseInt(startHour), parseInt(startMinute)];
	let endTime = [parseInt(endHour), parseInt(endMinute)];
	// get a random number
	let randomTimes = [];
	let seed =
		now.getDate().toString() +
		(now.getMonth()+1).toString() +
		now.getFullYear().toString();
	console.log("time",now.getDate().toString());
	console.log("SEED", seed);
	const rand = new RNG(seed);
	// make seed an integer
	
	// need pseudorandom numbers to avoid conflicts when syncing on multiple devices

	for (let i = 1; i <= frequency; i++) {
		let time = { hour: 0, minute: 0 };
        let randomFloat = rand.next();
		let randomHour = Math.floor(
			randomFloat * (endTime[0] - startTime[0]) + startTime[0])
		console.log("RANDOM TIME GENERATION Hour:"+randomHour+ "with float"+ randomFloat)
		let floatMinute = rand.next();
		let randomMinute = Math.floor(floatMinute * 60);
		console.log(
			"RANDOM TIME GENERATION Minute:",
			randomMinute + "with float" + floatMinute
		);
		time.hour = randomHour;
		time.minute = randomMinute;
		randomTimes.push(time);
	}

	return randomTimes;
}
export async function readConfig(body: any) {
	try {
		const storedConfig = await body.vault.adapter.read(
			"/.obsidian/plugins/Survey Plugin/data.json"
		);
		return JSON.parse(storedConfig);
	} catch (err) {
		return err;
	}
}
export function syncFromDatabase(app:any) {
	app.populateFireStore.retrieve().then(
		(data: {
			times: any;
			activeDay: any;
			timeRange: any;
			callCount: any;
			templateDir: any;
			mainDir: any;
		}) => {
			console.log("data", data);
			app.storedConfig = data;
			console.log("synced data", app.storedConfig);
			// this.app.workspace.showNotice("Synced Data from Firestore");
			app.settings.times = app.storedConfig.times;
			app.settings.activeDay = app.storedConfig.activeDay;
			app.settings.timeRange = app.storedConfig.timeRange;
			app.settings.callCount = app.storedConfig.callCount;
			app.settings.templateDir = app.storedConfig.templateDir;
			app.settings.mainDir = app.storedConfig.mainDir;
		},
		(err: any) => {
			console.log(err);
			console.log("error retrieving config on startup, reading the local config file instead");
			// push an obsidian notification
			// this.app.workspace.showNotice("error retrieving config on startup, reading the local config file instead");

			readConfig(this.app).then((data) => {
				this.storedConfig = data;
			});
		}
	);
}
export async function surveyFileMaker(
	TemplateDir: string,
	ActiveDay: Array<number>,
	time: { hour: number; minute: number }
) {
	// first load up the template fiel
	let template = await this.app.vault.adapter.read("/" + TemplateDir);
	console.log(template.split("---"));

	// split up the YAML from the template by '---'
	// the format of the markdown is year-month-day, year is the last index in ActiveDay, so make it the first
	// let formattedDay = ActiveDay.unshift(ActiveDay[2]);
	// if the month is less than 10, add a 0 to the front
	let day = ActiveDay[0] < 10 ? "0" + ActiveDay[0] : ActiveDay[0];
	let month = ActiveDay[1] < 10 ? "0" + ActiveDay[1] : ActiveDay[1];
	// if the day is less than 10, add a 0 to the front

	const formattedDate = ActiveDay[2] + "-" + month + "-" + day;
	// replace ::date:; with formattedDate
	
	let outPutsurvey = template
		.replace("::date::", formattedDate)
		.replace("::time::", time.hour + ":" + time.minute);
	console.log("template", outPutsurvey);
	// close the file

	return outPutsurvey;
}
export function URIGeneration(){
	const now: Date = new Date();
	const day: number = now.getDate();
	const year: number = now.getFullYear();
	const month: number = now.getMonth() + 1; // getMonth() returns 0-based index
	const months: string[] = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const urlFormat: string = `obsidian://open?vault=Obsidian%20Vault&file=surveys%2F${year}%2F${months[month-1]}%2F${day}%2FSurvey%20`;
	console.log(urlFormat)
	return urlFormat;

}

