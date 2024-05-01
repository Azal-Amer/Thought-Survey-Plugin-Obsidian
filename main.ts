import { Plugin } from 'obsidian'
import { SurveySettingTab } from "./SettingTab";
import { hex_sha1, b64_sha1 } from "./hashing/sha1";
import {
	randomTimeRange,
	syncFromDatabase,
	readConfig,
	surveyFileMaker,
	URIGeneration,
} from "./startupTasks";

import {DesktopNotification} from "./Notifications";
import { PopulateJsonFireStore } from "/Users/amer_/Desktop/Plugin Development Environment/Plugin Development/.obsidian/plugins/Survey Plugin/firebaseSetup/firebase";
interface PluginSettings {
	timeRange: string;
	callCount: string;
	templateDir: string;
	activeDay: Array<number>;
	times: Array<{ hour: number; minute: number }>;
	mainDir: string;
	
}
export const DEFAULT_SETTINGS: Partial<PluginSettings> = {
	timeRange:"8:00-17:00",
	callCount: "2",
	templateDir: "templates",
	mainDir: "surveys",
}
interface Time {
	hour: number;
	minute: number;
}

export default class ExamplePlugin extends Plugin {
	statusBarTextElement: HTMLElement;
	settings: PluginSettings;
	populateFireStore = new PopulateJsonFireStore();
	storedConfig: any;
	async assignTime(){
		console.log("assigning time")
		console.log('this.settings.times', this.settings)
		this.settings.times = randomTimeRange(
			this.settings.timeRange,
			parseInt(this.settings.callCount)
		);
		
		this.saveSettings();
		console.log("assigned time");
	}

	async initTimes() {
		//we need to check if we've already randomized the time for the date, if we haven't, we need to do so
		let today = new Date();
		let date = [today.getDate(), today.getMonth() + 1, today.getFullYear()];
		console.log("rootpath", this.app.vault.getRoot().path);
		// first check if we've defined the active day
		// 
	
		readConfig(this.app).then((data) => {
			this.storedConfig = data;
		});
		
		
		// if (this.settings.activeDay == undefined) {
			
		// }
		let dayCondition =
			JSON.stringify(this.settings.activeDay) == JSON.stringify(date);
		console.log("dayCondition", this.settings);
		
		if (this.settings.activeDay == undefined){
			this.settings.activeDay = date;
			this.assignTime();
			
		}

		// check if the indecies in active day are the same as the date
		if (!dayCondition) {
			console.log("we have not seen this day before");
			console.log(this.settings.activeDay);
			console.log(date);
			console.log(dayCondition);
			this.settings.activeDay = date;
			this.assignTime();
			this.createSurvey();
			syncFromDatabase(this)
			// If the day is new, we need to take whatever the newest copy of the database info is;
		} 
		 else {
			console.log("we have seen this day before");
			console.log(this.settings.times);
		}
	}
	surveyDirectoryConstructor(directory: string, date: Date) {
		console.log("calledDirectoryMaker");
		let [day, month, year] = [
			date.getDate(),
			date.getMonth(),
			date.getFullYear(),
		];
		// We want to check if there is a directory for the year, and if not make one
		let months = [
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
		let yearDirectory = `${directory}/${year}`;
		let monthDirectory = `${yearDirectory}/${months[month]}`;
		let dayDirectory = `${monthDirectory}/${day}`;
		let directories = [yearDirectory, monthDirectory, dayDirectory];
		for (let i = 0; i < directories.length; i++) {
			this.app.vault.adapter.exists(directories[i]).then((exists) => {
				if(!exists){
					console.log("here2");

					this.app.vault.adapter.mkdir(directories[i]);
				}
				
			});
		}
		return dayDirectory;
		// go through all the directories in the folder, if they don't exist, make them
	}
	async createSurvey() {
		const obsidianDir = this.app.vault.getRoot().path;
		console.log("obsidianDir", obsidianDir);
		
		let surveyDir = obsidianDir + "/" + "surveys";
		let storedSurveyDir = this.surveyDirectoryConstructor(
			surveyDir,
			new Date()
		);
		console.log("storedSurveyDir", storedSurveyDir);
		console.log("settings", this.settings);
		console.log("times", this.settings.times);

		for (let i = 0; i < this.settings.times.length; i++) {
			let time = this.settings.times[i];
			let survey = await surveyFileMaker(
				this.settings.templateDir,
				this.settings.activeDay,
				time
			);
			// make a new file with the contents of the survey file
			console.log("survey", survey);
			// only write if the file doesn't exist
			this.app.vault.adapter.exists(storedSurveyDir + `/Survey ${i}.md`).then((exists) => {
				if(exists){
					console.log("file exists");
					return;
				}
				else{
					this.app.vault.adapter.write(
						storedSurveyDir + `/Survey ${i}.md`,
						survey
					);
					
				}
			});
			// make a new file inside
		}
	}
	async onload() {
		let now = new Date();
		const notificationService = new DesktopNotification();
		let seed =
			now.getDate().toString() +
			(now.getMonth()+1).toString() +
			now.getFullYear().toString();
			const message = "Hello, World!";


		// access the data.json file that stores the settings
		// we need to save the active day
		
		await this.loadSettings().then(() => {
			console.log("loaded settings");
			// this.populateFireStore.populate();
			syncFromDatabase(this);
		});
		this.addSettingTab(new SurveySettingTab(this.app, this));
		// get the local obsidian directory
		this.initTimes();
		this.createSurvey();
		let URIBase = URIGeneration();
		console.log("URIBaseTest", URIBase+"0");
		const testTime = {hour: 14, minute: 44};
		for(let i = 0; i < this.settings.times.length; i++){
			notificationService.notify(
				"RealThoughts",
				`HURRY‼️ You have Survey ${i} due right now! `,
				this.settings.times[i],
				URIBase + i
			);
		}
	}
	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}
	async saveSettings(): Promise<void> {
		this.saveData(this.settings).then(() => {
			readConfig(this.app).then((data) => {
				this.storedConfig = data;
				console.log("Saving settings storedConfig", this.storedConfig);
				this.populateFireStore.data = this.storedConfig;
				this.populateFireStore.populate();
		})});
		
		// when we hit the save settings button, this will wait until the data is ready to be saved
	}
	// In typescript, as in the type, we now have types. When we're working, it's easier to define variables as the
	// objects we can manipulate for readability and manipulation. if we're defining a type, define corresponding to
	// definition's output
}