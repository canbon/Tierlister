//buttons
const btnAddTier = document.getElementById('btn-add-tier');
const btnSave = document.getElementById('btn-save');
const btnReset = document.getElementById('btn-reset');
const btnLoad = document.getElementById('btn-load');
const btnExport = document.getElementById('btn-export');
const btnAddImage = document.getElementById('btn-add-image');
const btnSelectText = document.getElementById('btn-text-select');
const btnSelectTier = document.getElementById('btn-tier-select');
const btnSaveImg = document.getElementById('btn-save-image');
const btnCopyImg = document.getElementById('btn-copy-image');
const btnImportImages = document.getElementById('btn-import-images');
const btnStartImport = document.getElementById('btn-get-tiermaker');
const btnToggleDelete = document.getElementById('btn-delete-images');
const btnToggleStroke = document.getElementById('btn-toggle-stroke');
const btnSwitchLayout = document.getElementById('btn-switch-layout');
const btnDeleteAll = document.getElementById('btn-delete-all');
//canvas
let currCanvas;
//two main containers
const tierContainer = document.getElementById('tierlist');
const imgContainer = document.getElementById('image-holder');
//modals
const imgModal = document.getElementById('screenshot-modal');
const colorModal = document.getElementById('color-modal')
//arrays
const tiers = [];
const images = [];
let labels = [];
const deleteBtns = [];
let colors = document.querySelectorAll('.color');
let containers = document.querySelectorAll('.container');
//current label
 currLabel = null;
 sampleTier = document.getElementById('sample-tier');
//sliders
const hueSlider = document.getElementById('hue-slider')
const satSlider = document.getElementById('saturation-slider')
const valSlider = document.getElementById('value-slider')
const alphaSlider = document.getElementById('alpha-slider')
//slider text input
const hueInput = document.getElementById('hue-input')
const satInput = document.getElementById('saturation-input')
const valInput = document.getElementById('value-input')
const alphaInput  = document.getElementById('alpha-input')
//input
const hexInput = document.getElementById('hex-input');
const textColorInput = document.getElementById('text-color-input');
const hslaInput = document.getElementById('text-hsla-input');
const tiermakerInput = document.getElementById('tiermaker-modal-input');
//string for hsla
let defhsla = `hsla(360, 100%, 35%, 1)`
let currhsla = defhsla;
let textOrTier = true;
//little helper for delete button visibility
let shouldBeSeen = false;
let shouldStroke = false;
let layoutSwitch = true;
//regex
const rgbaRegex = /^rgba?\(\s*(?!\d+(?:\.|\s*\-?)\d+\.\d+)\-?(?:\d*\.\d+|\d+)(%?)(?:(?:\s*,\s*\-?(?:\d+|\d*\.\d+)\1){2}(?:\s*,\s*\-?(?:\d+|\d*\.\d+)%?)?|(?:(?:\s*\-?\d*\.\d+|\s*\-\d+|\s+\d+){2}|(?:\s*\-?(?:\d+|\d*\.\d+)%){2})(?:\s*\/\s*\-?(?:\d+|\d*\.\d+)%?)?)\s*\)$/i;
const hexRegex = /^#([0-9a-f]{3}){1,2}$/i;
const hslaRegex = /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/;
const tiermakerRegex = /[(http(s)?):\/\/(www\.)tiermaker\+~#=]{2,256}\.[com]{2,6}(\/create)\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

const colorClasses = [
    'grad1','grad2','grad3','grad4','grad5','grad6','grad7','grad8','grad9','grad10','grad11','grad12','grad13','grad14','grad15','grad16',
    'solid1','solid2','solid3','solid4','solid5','solid6','solid7','solid8','solid9','solid10','solid11','solid12','solid13','solid14','solid15','solid16',
    'tiercolor1','tiercolor2','tiercolor3','tiercolor4','tiercolor5','tiercolor6','tiercolor7','tiercolor8','tiercolor9','tiercolor10','tiercolor11','tiercolor12','tiercolor13','tiercolor14','tiercolor15',
    'friend1','friend2','friend3','friend4','friend5','friend6','friend7','friend8','friend9','friend10','friend11','friend12','friend13','friend14','friend15','friend16','friend17'
]

var drake = dragula({
    isContainer: function(el) {
        return el.classList.contains('container');
    }
});

dragula([document.getElementById('tierlist')], {
    moves: function(el, container, handle) {
      return !handle.classList.contains('image');
    }
  });

window.onload = function() {
    sampleTier.style.setProperty('--custom-color', currhsla);
    drake.containers.push(imgContainer)
}

btnExport.addEventListener('click', () => {
    let data = JSON.stringify(tierContainer.innerHTML);
    console.log(data);
    if (data !== undefined) {
        window.api.send("saveJson", data);
        window.api.receive("fromMain", (data) => {
            if (data == 'true') {
                console.log('json save success');
            }else {
                console.log('json save failure')
            }
        });
    }
});

btnLoad.addEventListener('click', () => {
    let data = '';
    window.api.send("openJson", data);
    window.api.receive("fromMain", (data) => {
        if (data !== undefined && data !== null) {
            tierContainer.innerHTML = data;
            //rebuild tier event listeners on import
            let tierArr = document.querySelectorAll('.tier-container');
            tierArr.forEach(t => {
                
                let labelCont = t.querySelector('.tier-label-container');

                let label = labelCont.querySelector('.tier-label');
                labels.push(label);

                let tierSetBtn = t.querySelector('.settingsbtn');
                tierSetBtn.addEventListener('click', OpenTierSettingsModal);

                let tierDelBtn = t.querySelector('.deletebtn');
                tierDelBtn.addEventListener('click', e => {
                    deleteTier(e);
                });
                deleteBtns.push(tierDelBtn);
                toggleSeen(tierDelBtn);

                setLayout(t);
                tiers.push(t);
            });
            //rebuild image event listeners on import
            let imageArr = tierContainer.querySelectorAll('.per-image-container');
            imageArr.forEach(i => {
                images.push(i);
                let delImgBtn = i.querySelector('.delete-img-btn');
                delImgBtn.addEventListener('click', e => {
                    e.target.parentNode.remove();
                });
                toggleSeen(delImgBtn);
                deleteBtns.push(delImgBtn);
            });
        }
    });
});

btnSelectText.onclick = function() {
    textOrTier = false;
}

btnSelectTier.onclick = function() {
    textOrTier = true;
}

//slider input events
hueSlider.oninput = function() {
    hueInput.value = hueSlider.value;
    HSLToRGB(hueInput.value, satInput.value, valInput.value);
    HSLToHex(hueInput.value, satInput.value, valInput.value);
    setHSLA();
}

satSlider.oninput = function() {
    satInput.value = satSlider.value;
    HSLToRGB(hueInput.value, satInput.value, valInput.value);
    HSLToHex(hueInput.value, satInput.value, valInput.value);
    setHSLA();
}

valSlider.oninput = function() {
    valInput.value = valSlider.value;
    HSLToRGB(hueInput.value, satInput.value, valInput.value);
    HSLToHex(hueInput.value, satInput.value, valInput.value);
    setHSLA();
}

alphaSlider.oninput = function() {
    alphaInput.value = alphaSlider.value;
    HSLToRGB(hueInput.value, satInput.value, valInput.value);
    HSLToHex(hueInput.value, satInput.value, valInput.value);
    setHSLA();
}
//slider text input events
hueInput.addEventListener('input', () => {
    if (hueInput.value > 0 || hueInput.value < 360) {
        hueSlider.value = hueInput.value;
        setHSLA();
    }
});

satInput.addEventListener('input', () => {
    if (satInput.value > 0 || satInput.value < 100) {
        satSlider.value = satInput.value;
        setHSLA();
    }
});

valInput.addEventListener('input', () => {
    if (valInput.value > 0 || valInput.value < 100) {
        valSlider.value = valInput.value;
        setHSLA();
    }
});

alphaInput.addEventListener('input', () => {
    if (alphaInput.value > 0 || alphaInput.value < 1.0) {
        if (alphaInput.style.color == "red") {
            alphaInput.style.color = "black";
            setHSLA();
        }
        alphaSlider.value = alphaInput.value;
    }
    else {
        alphaInput.style.color = "red";
    }
});

hexInput.addEventListener('input', () => {
    console.log(hexRegex.test(hexInput.value));
    if (hexRegex.test(hexInput.value)) {
        hexToHSL(hexInput.value)
        hslaInput.oninput();
    }
});

textColorInput.addEventListener('input', () => {
    console.log(rgbaRegex.test(textColorInput.value));
    if (rgbaRegex.test(textColorInput.value)) {
        colorsOnly = textColorInput.value.substring(textColorInput.value.indexOf('(') + 1, textColorInput.value.lastIndexOf(')')).split(/,\s*/);
        RGBAToHSLA(colorsOnly[0], colorsOnly[1], colorsOnly[2], colorsOnly[3]);
        hslaInput.oninput();
    }
});

hslaInput.oninput = function() {
    console.log(hslaRegex.test(hslaInput.value));
    if (hslaRegex.test(hslaInput.value)) {
        currLabel.style.setProperty('--custom-color', hslaInput.value)
        sampleTier.style.setProperty('--custom-color', hslaInput.value);
        col = hslaInput.value.substring(hslaInput.value.indexOf('(')+1, hslaInput.value.lastIndexOf(')')).replaceAll('%', '');
        colorsOnly = col.split(/,\s*/);
        console.log(colorsOnly);
        HSLToRGB(colorsOnly[0], colorsOnly[1], colorsOnly[2]);
        HSLToHex(colorsOnly[0], colorsOnly[1], colorsOnly[2]);
        hueInput.value = colorsOnly[0];
        satInput.value = colorsOnly[1];
        valInput.value = colorsOnly[2];
        alphaInput.value = colorsOnly[3];
        hueSlider.value = colorsOnly[0];
        satSlider.value = colorsOnly[1];
        valSlider.value = colorsOnly[2];
        alphaSlider.value = colorsOnly[3]; 
        setHSLA();
    }
}

btnAddTier.onclick = function() {
    //make the tier container
    const newTier = document.createElement('div');
    tiers.push(newTier);
    newTier.id = `tier${tiers.length}`;
    newTier.classList.add('tier-container');

    document.getElementById('tierlist').appendChild(newTier);
    //make tier label container
    const tierLabel = document.createElement('div');
    tierLabel.classList.add('tier-label-container');
    tierLabel.id = `tier-label${tiers.length}`;
    newTier.appendChild(tierLabel);
    //make tier label
    const label = document.createElement('div');
    label.classList.add('tier-label', 'solid1');
    tierLabel.appendChild(label);
    labels.push(label);

    const text = document.createElement('span');
    text.classList.add('text');
    text.contentEditable = true;
    text.innerHTML += `New Tier`;
    label.appendChild(text);
    
    const tierBtns = document.createElement('div');
    tierBtns.classList.add('tier-btns-container');
    tierLabel.appendChild(tierBtns);


    const tierDeleteBtn = document.createElement('span');
    tierDeleteBtn.id = `tier-delete${tiers.length}`;
    tierDeleteBtn.classList.add('deletebtn', 'noselect');
    tierDeleteBtn.setAttribute('data-html2canvas-ignore', true);
    tierDeleteBtn.innerHTML = '&times;';
    tierDeleteBtn.addEventListener('click', e => {
        deleteTier(e);
    });
    toggleSeen(tierDeleteBtn);

    tierBtns.appendChild(tierDeleteBtn);
    deleteBtns.push(tierDeleteBtn);

    const tierSettingsBtn = document.createElement('span');
    tierSettingsBtn.id = `tier-btn${tiers.length}`;
    tierSettingsBtn.classList.add('settingsbtn', 'noselect', 'fa', 'fa-gear', 'fa-lg');
    tierSettingsBtn.setAttribute('data-html2canvas-ignore', true);
    tierSettingsBtn.addEventListener('click', OpenTierSettingsModal);
    
    tierBtns.appendChild(tierSettingsBtn);

    //make tier
    const l = document.createElement('div')
    l.classList.add('tier', 'container')
    containers = document.querySelectorAll('.container'); //get the new container in the containers nodelist

    newTier.appendChild(l);
    //console.log(newTier.outerHTML);
    setLayout(newTier);
    drake.containers.push(l);
}

btnAddImage.onclick = function() {
    window.api.send("toMain", "openFileBrowser");
    window.api.receive("fromMain", (data) => {
        console.log(data);
        if (data.canceled == false) {
            data.filePaths.forEach(e => {
                createImage(e);
            });
        }
    });
}

btnImportImages.onclick = function() {
    document.getElementById('tiermaker-modal').style.display = "block";
}

btnToggleDelete.addEventListener('click', () => {
    if (shouldBeSeen) {
        shouldBeSeen = false;
    }
    else {
        shouldBeSeen = true;
    }
    deleteBtns.forEach(e => {
        toggleSeen(e);
    });
    toggleDelAll();
});

btnSwitchLayout.addEventListener('click', () => {
    toggleLayout();
});

document.getElementById('tiermaker-close').onclick = function() {
    document.getElementById('tiermaker-modal').style.display = "none";
}

btnStartImport.onclick = function() {
    let errorMessage = document.getElementById('tiermaker-error');
    let url = tiermakerInput.value;
    tiermakerInput.value = '';
    errorMessage.innerHTML = '';
    if (tiermakerRegex.test(url)) {
        console.log('tiermaker regex passed');
        let spinner = document.getElementById('tiermaker-load');
        //disable input and show loading symbol
        btnStartImport.style.pointerEvents = 'none';
        spinner.style.visibility = 'visible';
        
        window.api.send("tiermaker", url);
        window.api.receive("fromMain", (data) => {
            spinner.style.visibility = 'hidden';
            btnStartImport.style.pointerEvents = 'all';
            console.log(data);
            if (data === undefined) return;
            if (data == 'false') {
                console.log('failed to retrieve images');
                errorMessage.innerHTML = 'failed to retrieve images';
            }
            else {
                errorMessage.innerHTML = '';
                data.forEach(e => {
                    createImage(e);
                });
            }
        });
    }
    else {
        console.log('false');
        errorMessage.innerHTML = 'Tiermaker link is not valid';
        btnStartImport.style.pointerEvents = 'all';
    }
}

//button event listeners
//open screenshot modal when save button is clicked
btnSave.onclick = function() {
    captureArea = document.querySelector('.capture');
    if (captureArea.hasChildNodes()) {
        if (layoutSwitch) {
            html2canvas(captureArea, 
                {
                    useCORS: true,
                    removeContainer: true,
                    backgroundColor: '#141414',
                    x:20,
                    width: $(captureArea).width()-20
                }).then(canvas => {
                    canvas.id = "canvas";
                    document.getElementById('screenshot-modal-image').appendChild(canvas);
                    currCanvas = canvas;
                });
        }
        else {
            html2canvas(captureArea, 
                {
                    useCORS: true,
                    removeContainer: true,
                    backgroundColor: '#141414'
                }).then(canvas => {
                    canvas.id = "canvas";
                    document.getElementById('screenshot-modal-image').appendChild(canvas);
                    currCanvas = canvas;
                });
        }
    }
    
    imgModal.style.display = "block";
}

btnCopyImg.onclick = function() {
    if (currCanvas !== undefined) {
        currCanvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]))
    }
}
//close screenshot modal when x is clicked
document.getElementById('screenshot-close').onclick = function() {
    imgModal.style.display = "none";
    if (currCanvas !== undefined) {
        document.getElementById('canvas').remove();
        currCanvas = undefined;
    }
}

btnSaveImg.onclick = async function() { 
    if (currCanvas !== undefined) {
        currCanvas.toBlob((blob) => {
            blob.arrayBuffer().then(buffer => {
                window.api.send("openSave", buffer);
                window.api.receive("fromMain", (data) => {
                    if (data == true) {
                        console.log('json save success');
                    }else {
                        console.log('json save failure')
                    }
                });
            })
        });
    }
}
//put all images back in the image tray
btnReset.onclick = function() {
    images.forEach(e => {
        document.getElementById('image-holder').appendChild(e);
    });
}

btnToggleStroke.onclick = function() {
    if (currLabel.classList.contains('stroke')) {
        sampleTier.classList.remove('stroke');
        currLabel.classList.remove('stroke');
    }
    else {
        currLabel.classList.add('stroke');
        sampleTier.classList.add('stroke');
    }
}

btnDeleteAll.onclick = function() {
    imgArr = document.querySelectorAll('.image');
    imgArr.forEach(e => {
        e.remove();
    });
}

colors.forEach(color => {
    color.addEventListener('click', () => {
        colorPress(color);
    });
});

function colorPress(color) {
    //reset class list so their are no unnecessary classes
    stroke = hasStroke(currLabel);
    currLabel.className = 'tier-label';
    sampleTier.className = '';

    setLayout(currLabel.parentNode.parentNode);

    if (stroke) {
        currLabel.classList.add('stroke');
        sampleTier.classList.add('stroke');
    }
    console.log(currLabel.classList);

    currLabel.classList.add(color.getAttribute("data-color"));
    sampleTier.classList.add(color.getAttribute("data-color"));
}

function toggleSeen(e) {
    if (shouldBeSeen) {
        e.style.visibility = "visible";
        btnDeleteAll.style.display = "block";
    }
    else {
        e.style.visibility = "hidden";
        btnDeleteAll.style.display = "none";
    }
}

function toggleDelAll() {
    if (shouldBeSeen) {
        btnDeleteAll.style.display = "block";
    }
    else {
        btnDeleteAll.style.display = "none";
    }
}

function setLayout(tier) {
    label = tier.querySelector('.tier-label');
    container = tier.querySelector('.tier');
    settingsBtn = tier.querySelector('.settingsbtn');
    deleteBtn = tier.querySelector('.deletebtn');
    labelContainer = tier.querySelector('.tier-label-container');
    btnContainer = tier.querySelector('.tier-btns-container');
    text = tier.querySelector('.text');
    
    if (layoutSwitch) {
            tier.classList.add('tier-container-side');
            label.classList.remove('tier-label-top');
            label.classList.add('tier-label-side');
            container.classList.add('tier-side');
            btnContainer.classList.add('tier-btn-side');
            deleteBtn.classList.add('deletebtn-side');
            text.classList.add('text-side');
            if(btnContainer.previousElementSibling) {
                btnContainer.parentNode.insertBefore(btnContainer, btnContainer.previousElementSibling);
            }
    }
    else {
            tier.classList.remove('tier-container-side');
            label.classList.remove('tier-label-side');
            label.classList.add('tier-label-top');
            container.classList.remove('tier-side');
            btnContainer.classList.remove('tier-btn-side');
            deleteBtn.classList.remove('deletebtn-side');
            text.classList.remove('text-side');
            if(btnContainer.nextElementSibling) {
                btnContainer.parentNode.insertBefore(btnContainer.nextElementSibling, btnContainer);
            }
    }
}

function toggleLayout() {
    if (layoutSwitch) {
        layoutSwitch = false;
    }
    else {
        layoutSwitch = true;
    }
    tiers.forEach(e => {
        setLayout(e);
    });
}

function hasColorClass(label) {
    let hasColor = false;
    colorClasses.forEach(e => {
        if (label.classList.contains(e)) {
            hasColor = true;
        }
    });
    return hasColor;
}

function hasStroke(label) {
    if (label.classList.contains('stroke')) return true;
    return false;
}

document.getElementById('color-close').onclick = function() {
    colorModal.style.display = "none";
}

function OpenTierSettingsModal(e) {
    textOrTier = true;
    colorModal.style.display = "block";
    currLabel = e.target.parentNode.parentNode.getElementsByClassName('tier-label')[0];
    console.log('aaa ' + currLabel.classList);
    stroke = hasStroke(currLabel);
    let colorClass = '';
    console.log(hasColorClass(currLabel))
    if (hasColorClass(currLabel)) {
        colorClasses.forEach(e => {
            console.log(e);
            if (currLabel.classList.contains(e)) {
                colorClass = e;
            }
        });
    }

    getHSLA();
    sampleTier.style.setProperty('--custom-color', currhsla);
    if (stroke) {
        currLabel.classList.add('stroke');
        sampleTier.classList.add('stroke');
    }
    console.log('class:' + colorClass);
    if (colorClass != '') {
        currLabel.classList.add(colorClass);
        sampleTier.classList.add(colorClass);
    }
    e.stopPropagation();
}

function deleteTier(e) {
    tier = e.target.parentNode.parentNode.parentNode;
    const images = tier.querySelectorAll('.per-image-container');
    images.forEach(e => {
        imgContainer.appendChild(e);
    });
    tier.remove();
}

function createImage(url) {
    let imgCont = document.createElement('div');
    imgCont.classList.add('per-image-container');

    /*let imgText = document.createElement('span');
    imgText.classList.add('image-text', 'stroke');
    imgText.innerHTML = 'asdl';//
    imgText.contentEditable = true;
    imgCont.appendChild(imgText);*/

    let newImage = document.createElement('img');
    newImage.src = url;
    newImage.classList.add('image');   
    newImage.title = /[^\\/:*?"<>|\r\n]+$/.exec(newImage.src);
    imgCont.appendChild(newImage);

    let deleteImgBtn = document.createElement('span');
    deleteImgBtn.classList.add('delete-img-btn', 'noselect');
    deleteImgBtn.setAttribute('data-html2canvas-ignore', true);
    deleteImgBtn.innerHTML = '&times;';
    deleteImgBtn.addEventListener('click', e => {
        e.target.parentNode.remove();
    });
    toggleSeen(deleteImgBtn);
    imgCont.appendChild(deleteImgBtn);
    
    images.push(imgCont);
    deleteImgBtn.id = `img-delete${images.length}`;
    deleteBtns.push(deleteImgBtn);
    document.getElementById('image-holder').appendChild(imgCont);
}

