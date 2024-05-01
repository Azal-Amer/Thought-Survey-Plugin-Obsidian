```dataview
TABLE WITHOUT ID file.frontmatter AS Properties
WHERE file.name = this.file.name
```
# Overview
- A project to go notify a user everywhere random points in a day simultaneously, to survey them about their thoughts, like bereal but for journaling and thoughts
# Syncing
- Current issue is that every node has access to the con

| ![[../../Supplemental Files/images/Survey Obsidian 2024-04-16 10.54.43.excalidraw]]                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------- |
| The issue above, is that if any of the arrows are severed by connection issues, the configuration can fall out of sync leading to failed surveying |

Can access draw document for below scs here ![[../../Excalidraw/Drawing 2024-04-16 13.18.47.excalidraw|Drawing 2024-04-16 13.18.47.excalidraw]]
Thus far, the above system has been implemented, (unrelated is the random time notifying but if Ic an get that local yay, if I can get a pseudorandom alg. working even better, if that's in the cloud too I have the key storage setup but ill cry cause it's the same issue)
See [[Survey Obsidian#Pseudorandom]] for notes thus far
WHAT IF THE CONFIGURATION ONLY TAKES PLACE ONCE EVERYONE HAS SIGNED IT, WE THEN KEEP TWO VERSIONS, AN IDEAL CONFIG AND A UNSIGNED ONE. WHEN EVERY DEVICE'S SIGNATURE IS ON IT, SYNC AND REPLACE. 

![[../../Supplemental Files/images/Pasted image 20240416135534.png]]
Starting here, let's have the third device launch and do it's ping, this causes the device to locally sync the new information and put it to the next day
![[../../Supplemental Files/images/Pasted image 20240416134826.png]]
Then let's have device one have a sync occur for launching the app or any random listening reason
ABOVE NOTE: CACHE CONFIG SIGS SHOULD HAVE WIPED
![[../../Supplemental Files/images/Pasted image 20240416134921.png]]

Let's say the day change then happens, so Device 1 and 2 make their new times. Device two is not connected to the internet that day, and isn't launched. In this event, it still had the changes approved, and we're good.
Otherwise say Device 2 was still open and the app was launched. IN that case, have it remove all notifs that day.
![[../../Supplemental Files/images/Pasted image 20240416135227.png]]
When Node 2 does come back online, we will then mark our signature as used(yellow), and then clear all of the signatures.

| ![[../../Supplemental Files/images/Pasted image 20240416135326.png]] | ![[../../Supplemental Files/images/Pasted image 20240416135338.png]] |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |


# Desktop
- [x] Implement file system populating
- [x] Random time selection
- [x] Plugin interface
	- [ ] Clean/restrict inputs from settings
- [x] Template pasting and document generation [[#Template Pasting]]
- [x] Pseudorandom number implementation
- [x] [Firestore config pushing (Computer)]
- [x] Notification setup
	- ![[Pasted image 20240321015537.png]]
## Template Pasting

> [!Warning] POTENTIAL CONFLICT: LAPTOP WITH NO WIFI
> If the laptop is disconnected from Wifi, it might try and make the survey files, which then conflict with the phone. We should treat phone as master. I think.

### Todo
- [x] Make the pasted Template
- [x] Load it into the plugin
- [x] Create custom YAML properties, paste that in too (maybe put this in the template?)
	- [x] Current Date (populated, this.activeDay) Link using `[[]]`
	- [x] Mood (unpopulated)
	- [x] Current Time (populated, this.activeDay)
- [x] Save the file into the constructed directory
### Notes
Loop (n):
- We should make this it's own function, which takes the template file as input, along with the activeDay and corresponding time
```
Loop(n){
(Already defined function) Template maker(File Template, <Obj>[] activeDay,<Obj> time):
	YAML format is extracted by seperating out by "---", then replacing associated tags of time and date
	return File file
	
}
```
![[Pasted image 20240325134922.png]]
- Above is the template format, note that the body is going to change, but I'll use the YAML
- If I wanted to, I could also change the time param to incl. generalize and say "morning, evening, afternoon, etc."



## Notifications:
- [x] URI generation 
https://github.com/shabegom/obsidian-reminders/blob/main/app.js
- [x] Check if on desktop, if so continue
- [x] Implement above code to send notifications, without the markdown search
### Notes
- Because we're an electron app, we can just use it's API. To send the notification, **Obsidian needs to be open**, but that's fine tbh.
- To check if we're on desktop, simply see if the electron API could be accessed
# Mobile
## Android Plugin Setup
- Trying to get the plugin working on mobile and desktop
	- ![[Pasted image 20240323185704.png]]
	- This error is happening cause well, we don't care
	I forgot that the data.json is in a diff spot, to get that we can use the obsidian vault functions for the root directory, but we need to pass the vault in 
![[Pasted image 20240323185754.png|300]]
The populate class has the absolute path to json as a parameter, so we just need to define that for each instance of the class
In main.ts, we put
![[Pasted image 20240323185927.png]]
**TODO**:
- [x] inside firestore.ts, we need to take the absolute path that was given, and modify it to route to our data.json
	- [x] It looks like firestore wants the absolute directory but we cant do that, can we access data.json from the main ts, and then pass down the file object? Good news is that obsidian has a file reader for the local DIR! We just need to parse it to a json, and we'll be good
	- Printing the file shows that right not i
## Pulling Data
- [x] ❗️❗️❗️ Firestore config Config Pulling 
	- [Reference Github documentation](https://github.com/firebase/quickstart-android/tree/master/firestore)
	- We've got our android studio environment setup thus far, but the Firebase SDK isn't loading properly so check this
	- **The interface can look like shit, i really don't care**
- [x] Parsing data.json
## Pseudorandom
- [x] Producing identical random numbers (check with obsidian to confirm)
	- ~~[ ] _sfc32_ algorithm is needed in java,~~ 
	- [x] Calculate Random times, confirm identical
ISSUE: The pseudorandom algs are too sensitive to inputs, which means diff languages under the hood produce increasingly differing outputs.

- Instead of the pseudorandom numbers, can we just keep a cached random list, and then when it's limit is reached, shuffle it with $\pi$  as the seed? 
Generated languages are btwn java/kotlin and TS
### Hashing to random number algorithm
- [x] Test implementation
	- implement in parallel in TS and Kotlin , then see if they produce the same result
	- 

| Language   | String  | Hash                                     |
| ---------- | ------- | ---------------------------------------- |
| Java       | 2142024 | 62a9c3c699e8a8f802b5f1695cb4c2dbf91c2991 |
| TypeScript | 2142024 | 62a9c3c699e8a8f802b5f1695cb4c2dbf91c2991 |
`npm run dev`
WE DID IT REDDIT THEY WORK IN PARALLEL
Can we go from the hash to a random seed that we can use, convert all of the stuff to binary, then decimal


| ![[../../Supplemental Files/images/Survey Obsidian 2024-04-21 01.36.12.excalidraw]] |
| ----------------------------------------------------------------------------------- |
If we implement the above in both java and TS, we should be done
- [x] Implement in TS
	- ![[../../Supplemental Files/images/Pasted image 20240422031435.png]]
- [x] Implement in JAVA
	- ![[../../Supplemental Files/images/Pasted image 20240422031422.png]]
- [ ] Make the checking apart of the schedule, at the start of each night around midnight, calculate these times and make notifications
## Notifications
- [x]  Obsidian URI Generation
	- [Documentation](https://github.com/firebase/quickstart-android/tree/master/firestore)
- [x] Push Notifications at specific times calculated
- [x] Make the app update new times in the database at night
	-  if when checked the database active day is not today, then the app will generate the times for today and will update the activeday condition. After doing this, it will then set the notifications
		- [x] Get deterministic random # calculation running (given day as seed)
			- ["generate these numbers, store them and import them as needed, make sure that they're easy to mark as used"](https://stackoverflow.com/questions/63153166/how-to-generate-the-same-random-numbers-in-one-language-as-in-another)

		- [x] Convert random# calculation to time
			- Typescript Code ![[Pasted image 20240326005746.png|500]] - In the above case, we just switch out the `Rand` object for whatever our final implementation is
		- [ ] Push to firestore
		- [ ] Update Active Day
	- [ ] If one of the nodes is disconnected from wifi (the mac), then it will generate it's own times.Hence **the same random number generation problem.**
Image detailing access permissions
![[PXL_20240326_065052299~2.jpg]]

For both, ensure that we've got syncing functioning properly
![[PXL_20240324_230731319~2.jpg]]

## Load Last Seen Config on Start
- This way if any changes to the config were made, they're installed **BEFORE FILE CONSTRUCTION** 
- Only recalculate times if it's a new day, updating only changes things for the next day
- Weird thing, the config only updates up to the change that happened ***just before***, so if I make change 1, then change 2, change 1 only appears when I make change 2

> [!IDEA] Make the project into a general tasks companion
> We use the Google workflow we established, and allow notifications on Android from obsidian

## Optimize size
- The file is HUGE with crazy load time
	- [ ] remove unnecessary packages 
# V2
- [ ] Improved Settings panel with inout rejection
- [ ] Top down google services integration and firebase setup
- [ ] Android app signing and notifying
# Notes:
### Firestore
[- Implementing Firestore Demo Youtube](https://www.youtube.com/watch?v=sAnffThJwuo)
- [Reference Github documentation](https://github.com/firebase/quickstart-android/tree/master/firestore)
	- This doesn't have any notes I can see, which makes this a PAIN to look through


