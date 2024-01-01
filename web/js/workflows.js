import { app } from '../../../scripts/app.js';

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

    const newSaveButton = () => {
      const saveButton = document.getElementById('comfy-save-button')
      console.log('saveButton', saveButton);

      saveButton.addEventListener('click', (event) => {
        // const name = projectNameInput.value;
        // saveProjectName(name);
        console.log('entrou no save');
        event.preventDefault();
        // event.stopPropagation();
        event.stopImmediatePropagation();
        event.cancelBubble = true;
      });

    };


    newSaveButton();
    loadProjectName();
  },
});
