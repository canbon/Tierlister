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
let draggables = document.querySelectorAll('.draggable');
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
//regex
const rgbaRegex = /^rgba?\(\s*(?!\d+(?:\.|\s*\-?)\d+\.\d+)\-?(?:\d*\.\d+|\d+)(%?)(?:(?:\s*,\s*\-?(?:\d+|\d*\.\d+)\1){2}(?:\s*,\s*\-?(?:\d+|\d*\.\d+)%?)?|(?:(?:\s*\-?\d*\.\d+|\s*\-\d+|\s+\d+){2}|(?:\s*\-?(?:\d+|\d*\.\d+)%){2})(?:\s*\/\s*\-?(?:\d+|\d*\.\d+)%?)?)\s*\)$/i;
const hexRegex = /^#([0-9a-f]{3}){1,2}$/i;
const hslaRegex = /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/;
const tiermakerRegex = /[(http(s)?):\/\/(www\.)tiermaker\+~#=]{2,256}\.[com]{2,6}(\/create)\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig;

const colorClasses = [
    'grad1','grad2','grad3','grad4','grad5','grad6','grad7','grad8','grad9','grad10','grad11','grad12','grad13','grad14','grad15','grad16',
    'solid1','solid2','solid3','solid4','solid5','solid6','solid7','solid8','solid9','solid10','solid11','solid12','solid13','solid14','solid15','solid16',
    'tiercolor1','tiercolor2','tiercolor3','tiercolor4','tiercolor5','tiercolor6','tiercolor7','tiercolor8','tiercolor9','tiercolor10','tiercolor11','tiercolor12','tiercolor13','tiercolor14','tiercolor15',
    'friend1','friend2','friend3','friend4','friend5','friend6','friend7','friend8','friend9','friend10','friend11','friend12','friend13','friend14','friend15','friend16','friend17'
]

window.onload = function() {
    sampleTier.style.setProperty('--custom-color', currhsla);
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
                t.addEventListener('dragstart', () => {
                    t.classList.add('dragging');
                });
            
                t.addEventListener('dragend', () => {
                    t.classList.remove('dragging');
                    
                });
            
                t.querySelector('.tier').addEventListener('dragover', e => {
                    imgContainerDragover(e, t.querySelector('.tier'));
                });
                
                let labelCont = t.querySelector('.tier-label-container');
                labelCont.addEventListener("mouseup", setDraggableFalse);
                labelCont.addEventListener("mousedown", setDraggableTrue); 

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

                console.log(label.classList);
            });
            //rebuild image event listeners on import
            let imageArr = tierContainer.querySelectorAll('.per-image-container');
            imageArr.forEach(i => {
                i.addEventListener('dragstart', e => {
                    e.stopPropagation();
                    i.classList.add('dragging');
                });
            
                i.addEventListener('dragend', () => {
                    i.classList.remove('dragging');
                });

                let delImgBtn = i.querySelector('.delete-img-btn');
                delImgBtn.addEventListener('click', e => {
                    e.target.parentNode.remove();
                });
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

tierContainer.addEventListener('dragover', tierContainerDragover);

imgContainer.addEventListener('dragover', e => {
    imgContainerDragover(e, imgContainer);
});

console.log(draggables, containers);

btnAddTier.onclick = function() {
    //make the tier container
    let newTier = document.createElement('div');
    tiers.push(newTier);
    newTier.id = `tier${tiers.length}`;
    newTier.classList.add('tier-container', 'draggable');
    
    //add events to draggable tiers
    newTier.addEventListener('dragstart', () => {
        newTier.classList.add('dragging');
    });

    newTier.addEventListener('dragend', () => {
        newTier.classList.remove('dragging');
        
    });

    document.getElementById('tierlist').appendChild(newTier);
    //make tier label container
    let tierLabel = document.createElement('div');
    tierLabel.classList.add('tier-label-container');
    tierLabel.id = `tier-label${tiers.length}`;
    newTier.appendChild(tierLabel);
    //make tier label
    let l = document.createElement('div');
    l.classList.add('tier-label', 'solid1'); //make it draggable
    l.contentEditable = true;
    l.innerHTML += `New Tier`;

    tierLabel.appendChild(l);
    labels.push(tierLabel);
    
    let tierBtns = document.createElement('div');
    tierBtns.classList.add('tier-btns-container');
    tierLabel.appendChild(tierBtns);

    let tierDeleteBtn = document.createElement('span');
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

    let tierSettingsBtn = document.createElement('span');
    tierSettingsBtn.id = `tier-btn${tiers.length}`;
    tierSettingsBtn.classList.add('settingsbtn', 'noselect', 'fa', 'fa-gear', 'fa-lg');
    tierSettingsBtn.setAttribute('data-html2canvas-ignore', true);
    tierSettingsBtn.addEventListener('click', OpenTierSettingsModal);
    
    tierBtns.appendChild(tierSettingsBtn);

    //these mouse events make it so the tier is only draggable by the title/top bar
    tierLabel.addEventListener("mouseup", setDraggableFalse);
    tierLabel.addEventListener("mousedown", setDraggableTrue);  

    //make tier
    l = document.createElement('div')
    l.classList.add('tier', 'container')
    containers = document.querySelectorAll('.container'); //get the new container in the containers nodelist
    
    //add container event listeners
    l.addEventListener('dragover', e => {
        imgContainerDragover(e, l);
    });

    newTier.appendChild(l);
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
});

document.getElementById('tiermaker-close').onclick = function() {
    document.getElementById('tiermaker-modal').style.display = "none";
}

btnStartImport.onclick = function() {
    if (tiermakerRegex.test(tiermakerInput.value)) {
        console.log('true');
        let url = tiermakerInput.value;
        window.api.send("tiermaker", url);
        window.api.receive("fromMain", (data) => {
            console.log(data);
            if (data !== undefined) {
                data.forEach(e => {
                    createImage(e);
                });
            }
            tiermakerInput.value = '';
        });
    }
    else {
        console.log('false');
    }
}

//button event listeners
//open screenshot modal when save button is clicked
btnSave.onclick = function() {
    captureArea = document.querySelector('.capture');
    if (captureArea.hasChildNodes()) {
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

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        console.log(`started dragging ${draggable}`)
    })
})

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
        e.style.display = "inline";
    }
    else {
        e.style.display = "none";
    }
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

function setDraggableTrue(e) {
    e.target.parentNode.setAttribute('draggable', true);
}

function setDraggableFalse(e) {
    e.target.parentNode.setAttribute('draggable', false);
}

function imgContainerDragover(e, c) {
    e.preventDefault();
    const cursorOverElement = document.elementFromPoint(e.clientX, e.clientY);
    const d = document.querySelector('.per-image-container.dragging');

    if (d === null || !d.classList.contains('per-image-container')) return;

    if (cursorOverElement != undefined) {
        if (cursorOverElement.classList.contains('per-image-container')) {
            box = cursorOverElement.querySelector('.image').getBoundingClientRect();
            //console.log(box);
            boxDragging = d.getBoundingClientRect();
            offsetX = e.clientX - box.left - box.width/2;

            if (offsetX < 0) {
                c.insertBefore(d, cursorOverElement);
            }
            else {
                c.insertBefore(d, cursorOverElement.nextSibling);
            }
        }
        else if (cursorOverElement.classList.contains('image')) {
            //console.log(cursorOverElement);
            box = cursorOverElement.getBoundingClientRect();
            //console.log(box);
            boxDragging = d.getBoundingClientRect();
            offsetX = e.clientX - box.left - box.width/2;
            //console.log(offsetX);
            if (offsetX < 0) {
                c.insertBefore(d, cursorOverElement.parentNode);
            }
            else {
                c.insertBefore(d, cursorOverElement.parentNode.nextSibling);
            }
        }
        else {
            c.appendChild(d);
        }
    }
}

function tierContainerDragover(e) {
    e.preventDefault();
    let cursorOverElement = document.elementFromPoint(e.clientX, e.clientY);
    const d = document.querySelector('.tier-container.dragging');
    
    if (d === null || !d.classList.contains('tier-container')) return;

    if (cursorOverElement !== undefined) {
        if (cursorOverElement.classList.contains('tier') 
        || cursorOverElement.classList.contains('tier-label') 
        || cursorOverElement.classList.contains('tier-label-container') 
        || cursorOverElement.classList.contains('tier-container')) {
            
            if (!cursorOverElement.classList.contains('tier-container')) cursorOverElement = cursorOverElement.parentNode;
            if (cursorOverElement.classList.contains('tier-label')){
                return;
            }
            //console.log(cursorOverElement);

            box = cursorOverElement.getBoundingClientRect();
            boxDragging = d.getBoundingClientRect();
            offsetY = e.clientY - box.top - box.height/2;
            
            if (offsetY < 0) {
                tierContainer.insertBefore(d, cursorOverElement);
            }
            else {
                tierContainer.insertBefore(d, cursorOverElement.nextSibling);
            }
        }
        else {
            tierContainer.appendChild(d);
        }
    }
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
    imgCont.classList.add('per-image-container', 'draggable');
    imgCont.draggable = true;
    draggables = document.querySelectorAll('.draggable'); //get the new container in the containers nodelist
    
    //add the event listeners for dragging
    imgCont.addEventListener('dragstart', e => {
        e.stopPropagation();
        imgCont.classList.add('dragging');
    });

    imgCont.addEventListener('dragend', () => {
        imgCont.classList.remove('dragging');
    });

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

