import ExamplePlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { DEFAULT_SETTINGS } from "./main";
import { randomTimeRange } from "./startupTasks";

export class SurveySettingTab extends PluginSettingTab {
    plugin: ExamplePlugin;
    constructor(app: App, plugin: ExamplePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    updateTime(htmlTimes: HTMLElement) {
        let stringTimes;
        try{
            stringTimes = this.plugin.settings.times
				.map((time) => {
					return time.hour + ":" + time.minute;
				})
				.toString();
        }
        catch{
            stringTimes = "No times set";
        }
		htmlTimes.setText(stringTimes);
    }
    display(): void{
        let {containerEl} = this;
        containerEl.empty();
        let htmlTimes = containerEl.createEl('div');
        this.updateTime(htmlTimes);

        

        // appends an empty container object to the container element
        // in the settings put the notification times as an element
        new Setting(containerEl)
            .setName("Time Range")
            .setDesc("The time range you're available for the plugin to notify you")
            .addText(text => text
                .setPlaceholder("8:00-17:00")
                .setValue(this.plugin.settings.timeRange)
                .onChange(async (value) => {
                    this.plugin.settings.timeRange = value;
                    await this.plugin.saveSettings();
                }));
        let callCountStored;
        try{
            callCountStored=this.plugin.settings.callCount.toString();
        }
        catch{
            callCountStored="2";
        }
        new Setting(containerEl)
			.setName("Call Count")
			.setDesc("The number of times you want to be surveyed")
			.addText((text) =>
				text
					.setPlaceholder("2")
					.setValue(callCountStored)
					.onChange(async (value) => {
						this.plugin.settings.callCount = value;
						await this.plugin.saveSettings();
					})
			);
        new Setting(containerEl)
			.setName("Template Directory")
			.setDesc("The location of the survey template")
			.addText((text) =>
				text
					.setPlaceholder("templates")
					.setValue(this.plugin.settings.templateDir)
					.onChange(async (value) => {
						this.plugin.settings.templateDir = value;
						await this.plugin.saveSettings();
					})
			);
        new Setting(containerEl)
			.setName("Main Directory")
			.setDesc("The directory to store the surveys in")
			.addText(text =>
				text
					.setPlaceholder("surveys")
					.setValue(this.plugin.settings.mainDir)
					.onChange(async (value) => {
						this.plugin.settings.mainDir = value;
						await this.plugin.saveSettings();
					}));
        new Setting(containerEl)
            .setName("Reset Settings")
            .setDesc("Reset the settings to default")
            .addButton(button => button
                .setButtonText("Reset")
                .onClick(async () => {
                    this.plugin.settings.timeRange = "8:00-17:00";
                    this.plugin.settings.callCount = "2";
                    this.plugin.settings.templateDir = "templates";
                    this.plugin.settings.times = [];
                    this.plugin.settings.activeDay = [0,0,0];
                    await this.plugin.saveSettings();
                    this.display();
                }));
        new Setting(containerEl)
            .setName("Update")
            .setDesc(" Update the config in Firestore")
            .addButton(button => button
                .setButtonText("Update")
                .onClick(async () => {
                    // this.plugin.settings.times = randomTimeRange(
					// 	this.plugin.settings.timeRange,
					// 	parseInt(this.plugin.settings.callCount)
					// );
                    // - Only recalculate times if it's a new day, updating only changes things for the next day
                    // this.updateTime(htmlTimes);
                    this.plugin.saveSettings();
                }));
        new Setting(containerEl)
			.setName("Force Update Times")
			.setDesc(
				"Force Update the Surveyed times for the day (ANY CHANGES MADE WILL APPLY TO THE NEXT DAY, THIS IS FOR TESTING ONLY)"
			)
			.addButton((button) =>
				button.setButtonText("Times Update").onClick(async () => {
					this.plugin.settings.times = randomTimeRange(
						this.plugin.settings.timeRange,
						parseInt(this.plugin.settings.callCount)
					);
					// - Only recalculate times if it's a new day, updating only changes things for the next day
					this.updateTime(htmlTimes);
					this.plugin.saveSettings();
				})
			);
        new Setting(containerEl)
			.setName("Force Recreate Survey Files")
			.setDesc(
				"Force Reset Survey Files"
			)
			.addButton((button) =>
				button.setButtonText("File Reset").onClick(async () => {
					this.plugin.createSurvey();
					// - Only recalculate times if it's a new day, updating only changes things for the next day
					this.updateTime(htmlTimes);
					this.plugin.saveSettings();
				})
			);
    }
}
