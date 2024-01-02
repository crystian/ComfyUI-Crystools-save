# ComfyUI-Crystools-save [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fcrystian%2FComfyUI-Crystools-save&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com) [![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/crystian77)

**_You can save your workflows with a particular file name (finally!), and save author info as metadata_**

With this quality of life extension, you can save your workflow with a specific name and include additional details such as the author, a description, and the version (in metadata/json).
**Important:** When you share your workflow (via png/json), others will be able to see your information!

It works transparently; you can load/import the information in the traditional way.

## Settings
![Settings](./docs/settings.png)
 
* `Use new save button?`: I've to change the default behavior of the "save" button. Now it saves the workflow with the name of the project, may you don't want this, so you can turn off this feature.
* `Show project name in menu`: Show the project name in the menu (see below).
* `Project name`: The name of the project, it will be used to save the workflow and file name.
* `Author`: The author of the project.
* `Description`: A description of the project.
* `Version`: The version of the project.

## Menu
![Project-name](./docs/project-name.png)

You can turn on/off the project name in the menu (see settings).

## Metadata

If you want to see the metadata, you can use the "Crystools" extension with a node for this.


## Important notes

* I used a specific field in metadata/json: "workflow.extra." I've created an "info" property to store this information. I don't know, and I haven't found any documentation about this, so I hope it's not a problem.
