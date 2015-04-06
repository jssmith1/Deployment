# Homework 4
This repository contains the infrastructure for deploying the application from [Homework 3](https://github.com/jssmith1/Queues/). 

##Configuration
The infrastructure and application files contain some varaibles that may require some configuration.
* REDISLOC must point to your redis instalation.
* Specify the path to where the app is stored: deploy/blue-www/app.js
* In app.js, toggle the MIRROR flag

## Evaluation 

### Complete git/hook setup: 50% + Create blue/green infrastructure: 60%
The attached image illustrates the implementation of the green/blue git hooks.
![image](https://cloud.githubusercontent.com/assets/5032534/7012749/6553e374-dc81-11e4-913f-2370f7c91bea.png)

### Demonstrate `/switch` route: 70%
In infrastructure.js the proxy switches its target:
```javascript
if (req.url == "/switch"){
//Switch the target
	if(TARGET == GREEN){
		TARGET = BLUE;
	}
	else if(TARGET == BLUE){
		TARGET = GREEN
	}
}
```
### Demonstrate migration of data on switch: 85%
Migration of data is handled inside the app:
```javascript
if(!MIRROR){  //Don't copy if images are already mirrored
	client.lrange(imgLstKey, 0, -1, function(err, value){
		for(var i = 0; i < value.length; i++){
			otherClient.rpush(imgLstKey, value[i]);
		}
	})
}
res.send("Switched from " + color);
```

### Demonstrate mirroring: 100%
The MIRROR flag can be set to true or false for the blue and/or green deployment. This flag is used to check whether to mirror image pushes/pops onto the other deployment.
