import { app } from '../../../scripts/app.js';
import { $el } from '../../../scripts/ui.js';

const idProjectNameText = 'Crystools.projectName';
const idProjectNameShow = 'Crystools.projectNameShow';
const defaultProjectName = 'Project name12';
const defaultProjectNameShow = true;
const prefix = '[Crystools] ';
const classCrystoolsMenu = 'crystools-menu';

// references of htmls elements
let projectNameInputRef = null;

const showProjectName = (value) => {
  const ctools = document.getElementById(classCrystoolsMenu);

  // validation because this run before setup
  if (ctools) {
    ctools.style.display = value ? 'block' : 'none';
  }
};

const updateProjectName = (value) => {
  const ctools = document.getElementById(classCrystoolsMenu);

  // validation because this run before setup
  if (ctools && projectNameInputRef) {
    projectNameInputRef.value = value;
  }
};

app.ui.settings.addSetting({
  id: idProjectNameText,
  name: prefix + 'Project name',
  type: 'text',
  defaultValue: app.ui.settings.getSettingValue(idProjectNameText, defaultProjectName),
  onChange: updateProjectName,
});

app.ui.settings.addSetting({
  id: idProjectNameShow,
  name: prefix + 'Show project name in menu',
  type: 'boolean',
  defaultValue: defaultProjectNameShow,
  onChange: showProjectName,
});


app.registerExtension({
  name: idProjectNameShow,
  async setup() {
    const queueBtn = document.getElementById('queue-button');

    const ctools = document.createElement('div');
    ctools.setAttribute('id', classCrystoolsMenu);
    ctools.classList.add(classCrystoolsMenu);
    ctools.classList.add('comfy-menu-btns');
    ctools.style.width = '100%';
    queueBtn.insertAdjacentElement('afterend', ctools);

    showProjectName(app.ui.settings.getSettingValue(idProjectNameShow, defaultProjectNameShow));

    const projectNameInput = document.createElement('input');
    projectNameInput.style.margin = '4px 4px';
    projectNameInput.style.width = '100%';
    projectNameInputRef = projectNameInput;
    ctools.append(projectNameInput);

    projectNameInput.addEventListener('blur', (event) => {
      saveProjectName(event.target.value);
    });

    projectNameInput.addEventListener('keyup', (event) => {
      saveProjectName(event.target.value);
    });

    const saveProjectName = (name) => {
      app.ui.settings.setSettingValue(idProjectNameText, name);
      updateProjectName(name);
    };

    const loadProjectName = () => {
      projectNameInput.value = app.ui.settings.getSettingValue(idProjectNameText, defaultProjectName);
    };

    const reimplementSaveButton = () => {
      let saveButton = document.getElementById('comfy-save-button')
      const saveClickEvents = saveButton.onclick;

      // remove all event listeners
      const clone = saveButton.cloneNode(true)
      saveButton.replaceWith(clone);

      // add new event listener
      clone.addEventListener('click',(event) => {
        let filename = projectNameInput.value + '.json';

        // literally copied and pasted from comfy ui.js ...

        const promptFilename = app.ui.settings.getSettingValue('Comfy.PromptFilename', true);

        if (promptFilename) {
          filename = prompt("Save workflow as:", filename);
          if (!filename) return;
          if (!filename.toLowerCase().endsWith(".json")) {
            filename += ".json";
          }
        }

        app.graphToPrompt().then(p=> {
          const json = JSON.stringify(p.workflow, null, 2); // convert the data to a JSON string
          const blob = new Blob([json], {type: "application/json"});
          const url = URL.createObjectURL(blob);
          const a = $el("a", {
            href: url,
            download: filename,
            style: {display: "none"},
            parent: document.body,
          });
          a.click();
          setTimeout(function () {
            a.remove();
            window.URL.revokeObjectURL(url);
          }, 0);
        });

      });
    };

    reimplementSaveButton();
    loadProjectName();
  },
});
