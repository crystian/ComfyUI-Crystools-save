import { app } from '../../../scripts/app.js';
import { $el } from '../../../scripts/ui.js';


// common variables
const idProjectName = 'Crystools.projectName';
const idProjectNameText = 'Crystools.projectNameText';
const idProjectNameShow = 'Crystools.projectNameShow';
const defaultProjectNameText = 'workflow';
const defaultProjectNameShow = true;
const menuPrefix = '[Crystools.save] ';
const htmlIdCrystoolsMenu = 'crystools-menu';


// references of htmls elements
let inputRefProjectNameText = null;


const getInfoOnGraph = () => {
  return app.graphToPrompt();
};

// just persist the data on workflow reference
const saveInfoOnGraph = (value) => {
  return getInfoOnGraph().then((p) => {
    if (!p.workflow.extra.info) {
      p.workflow.extra.info = {};
    }

    p.workflow.extra.info.name = value;
    p.workflow.extra.info.author = 'crystools';
  });
};


const saveProjectName = (name) => {
  // yeap, there are two places to save the data ...
  app.ui.settings.setSettingValue(idProjectNameText, name);
  updateProjectName(name);
};

const updateProjectName = (value) => {
  const ctools = document.getElementById(htmlIdCrystoolsMenu);

  // validation because this run before setup
  if (ctools && inputRefProjectNameText) {
    inputRefProjectNameText.value = value;
    saveInfoOnGraph(value);
  }
};
app.ui.settings.addSetting({
  id: idProjectNameText,
  name: menuPrefix + 'Project name',
  type: 'text',
  defaultValue: defaultProjectNameText,
  onChange: updateProjectName,
});

const showProjectName = (value) => {
  const ctools = document.getElementById(htmlIdCrystoolsMenu);

  // validation because this run before setup
  if (ctools) {
    ctools.style.display = value ? 'block' : 'none';
  }
};
app.ui.settings.addSetting({
  id: idProjectNameShow,
  name: menuPrefix + 'Show project name in menu',
  type: 'boolean',
  defaultValue: defaultProjectNameShow,
  onChange: showProjectName,
});

app.registerExtension({
  name: idProjectName,
  async setup() {

    // const onConfigure = app.graph.prototype.onConfigure;
    app.graph.onConfigure = () => {
      // on drops a file on the canvas
      getInfoOnGraph().then((p) => {
        saveProjectName(p.workflow.extra?.info?.name || defaultProjectNameText);
      });

    };

    const queueBtn = document.getElementById('queue-button');

    const ctools = document.createElement('div');
    ctools.setAttribute('id', htmlIdCrystoolsMenu);
    ctools.classList.add(htmlIdCrystoolsMenu);
    ctools.classList.add('comfy-menu-btns');
    ctools.style.margin = '8px 0';
    ctools.style.width = '100%';
    queueBtn.insertAdjacentElement('afterend', ctools);

    const projectNameInput = document.createElement('input');
    projectNameInput.setAttribute('placeholder', 'Project name');
    projectNameInput.style.width = '80%';
    inputRefProjectNameText = projectNameInput;
    ctools.append(projectNameInput);

    // this boolean does not save the value on workflow
    showProjectName(app.ui.settings.getSettingValue(idProjectNameShow, defaultProjectNameShow));

    // this text save the value on workflow and localstorage
    saveProjectName(app.ui.settings.getSettingValue(idProjectNameText, defaultProjectNameText));

    // events for the input to persist the data on workflow
    projectNameInput.addEventListener('blur', (event) => {
      saveProjectName(event.target.value);
    });
    projectNameInput.addEventListener('keyup', (event) => {
      saveProjectName(event.target.value);
    });

    const reimplementSaveButton = () => {
      let saveButton = document.getElementById('comfy-save-button');
      const saveClickEvents = saveButton.onclick;

      // remove all event listeners
      const clone = saveButton.cloneNode(true);
      saveButton.replaceWith(clone);

      // add new event listener
      clone.addEventListener('click', async(event) => {
        let filename = projectNameInput.value + '.json';
        // literally copied and pasted from comfy ui.js ... https://github.com/comfyanonymous/ComfyUI/blob/master/web/scripts/ui.js#L710C10-L710C10

        const promptFilename = app.ui.settings.getSettingValue('Comfy.PromptFilename', true);

        // ¯\_(ツ)_/¯
        if (promptFilename) {
          filename = prompt('Save workflow as:', filename);
          if (!filename) {
            return;
          }
          if (!filename.toLowerCase().endsWith('.json')) {
            filename += '.json';
          }
        }

        console.log('filename', filename);

        const p = await app.graphToPrompt();
        const json = JSON.stringify(p.workflow, null, 2); // convert the data to a JSON string
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = $el('a', {
          href: url,
          download: filename,
          style: {display: 'none'},
          parent: document.body,
        });
        a.click();
        setTimeout(function() {
          a.remove();
          window.URL.revokeObjectURL(url);
        }, 0);
      });

    };

    reimplementSaveButton();
  },
});
