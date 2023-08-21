/*
    by Andrew Debevec, rewritten in 2023 based on original code from 2014
    general thoughts:
    - tried to be deliberate about breaking up logical steps and labelling things consistently
      - e.g., parta, partb, partc; acheck, bcheck, ccheck, with functions checkA, checkB, checkC...
      - but since partc - parte use the same region, they are all in partc and revealed as needed
*/


function init() {
    document.getElementById("acheck").addEventListener("click", checkA);
    document.getElementById("bcheck").addEventListener("click", checkB);
    document.getElementById("ccheck").addEventListener("click", checkC);
    // checkD and checkE reuse the "button#checkc" button -- event listeners
    // are changed at the end of checkC (-> checkD) and checkD (-> checkE)
    document.getElementById("fcheck").addEventListener("click", checkF);
    document.getElementById("gcheck").addEventListener("click", checkG);

    document.querySelectorAll(".draggable.gg").forEach(function(x) {
        x.addEventListener("dragstart", gameteDragStart);
        x.addEventListener("click", gameteDragStartClick);
        x.addEventListener("keyup", gameteDragStartEnter);
    });

    document.querySelectorAll(".gametedropzone").forEach(function(x) {
        x.addEventListener("dragover", gameteDragOver);
        x.addEventListener("drop", gameteDrop);
        x.addEventListener("click", gameteDropClick);
        x.addEventListener("keyup", gameteDropEnter);
    });
}

function checkA(event) {
    //pull the inputs
    let wt = [];
    let eb = [];
    let ap = [];
    let ebap = document.getElementById("a_ebap_1");
    
    let errors = [];

    for(let i=1;i<=4;i++) {
        if(i < 3) {
            eb.push(document.getElementById("a_eb_" + i));
            ap.push(document.getElementById("a_ap_" + i));
        }
        wt.push(document.getElementById("a_wt_" + i));
    }

    // check wt answers: EEAA, EeAA, EEAa, EeAa
    let found = [false, false, false, false];
    for(let e of wt) {
        if(e.value === "EEAA") {
            if(found[0]) {
                errors.push(e);
            } else {
                found[0] = true;
            }
        } else if(e.value === "EeAA") {
            if (found[1]) {
                errors.push(e);
            } else {
                found[1] = true;
            }
        } else if (e.value === "EEAa") {
            if (found[2]) {
                errors.push(e);
            } else {
                found[2] = true;
            }
        } else if (e.value === "EeAa") {
            if (found[3]) {
                errors.push(e);
            } else {
                found[3] = true;
            }
        } else {
            errors.push(e);
        }
    }

    // check eb answers:  eeAa, eeAA
    found = [false, false];
    for(let e of eb) {
        if (e.value === "eeAa") {
            if (found[0]) {
                errors.push(e);
            } else {
                found[0] = true;
            }
        } else if (e.value === "eeAA") {
            if (found[1]) {
                errors.push(e);
            } else {
                found[1] = true;
            }
        } else {
            errors.push(e);
        }
    }

    // check ap answers:  Eeaa, EEaa
    found = [false, false];
    for (let e of ap) {
        if (e.value === "Eeaa") {
            if (found[0]) {
                errors.push(e);
            } else {
                found[0] = true;
            }
        } else if (e.value === "EEaa") {
            if (found[1]) {
                errors.push(e);
            } else {
                found[1] = true;
            }
        } else {
            errors.push(e);
        }
    }

    // check ebap answer: eeaa
    if(ebap.value !== "eeaa") {
        errors.push(ebap);
    }

    if(errors.length > 0) {
        show("afeedback");
        unhighlightAll("parta");
        highlight(errors);
        errors[0].focus();
    } else {
        hide("afeedback");
        show("partb");
        show("binstructions");
        hide("acheck");
        unhighlightAll("parta");

        scrollDown();

        resetAndDisable(wt);
        resetAndDisable(eb);
        resetAndDisable(ap);
        resetAndDisable([ebap]);
        event.target.disabled = true;
    }
}

function checkB(event) {
    //pull the inputs
    let f = [];
    let m = [];

    let errors = [];

    for (let i = 1; i <= 4; i++) {
        f.push(document.getElementById("b_f" + i));
        m.push(document.getElementById("b_m" + i));
    }

    //initialize found array for father
    let found = [false, false, false, false];

    // cycle through all father inputs, then reset found and check mother inputs
    for (let i = 0; i < 8; i++) {
        if(i < 4) {
            e = f[i];
        } else {
            e = m[i-4];
        }

        // reset found array when starting mother checks
        if(i === 4) {
            found = [false, false, false, false];
        }

        if (e.value === "EA") {
            if (found[0]) {
                errors.push(e);
            } else {
                found[0] = true;
            }
        } else if (e.value === "Ea") {
            if (found[1]) {
                errors.push(e);
            } else {
                found[1] = true;
            }
        } else if (e.value === "eA") {
            if (found[2]) {
                errors.push(e);
            } else {
                found[2] = true;
            }
        } else if (e.value === "ea") {
            if (found[3]) {
                errors.push(e);
            } else {
                found[3] = true;
            }
        } else {
            errors.push(e);
        }
    }

    if (errors.length > 0) {
        show("bfeedback");
        scrollDown();
        unhighlightAll("partb");
        highlight(errors);
        errors[0].focus();
    } else {
        hide("bfeedback");
        show("partc");
        show("cinstructions");
        hide("bcheck");
        unhighlightAll("partb");

        document.getElementById("partbc_flex").classList.remove("in_part_b");
        scrollDown();
        
        initC();

        resetAndDisable(f);
        resetAndDisable(m);
        event.target.disabled = true;
    }
}

function checkC(event) {
    // c = gamete genotypes drag/drop
    let gdz = document.querySelectorAll("div#partc th.gametedropzone");

    let errors = [];
    // 0-3 = father; 4-7 = mother
    // check that 0-3 contain ".father.draggable" and 4-7 contain ".mother.draggable"
    for(let i=0;i<4;i++) {
        let f = gdz[i];
        let m = gdz[i+4];

        if(!(f.querySelector(".father.draggable"))) {
            errors.push(f);
        }
        if(!(m.querySelector(".mother.draggable"))) {
            errors.push(m);
        }
    }

    if (errors.length > 0) {
        show("cfeedback");
        unhighlightAll("partc");
        highlight(errors);
        errors[0].focus();
        scrollDown();
    } else {
        hide("cfeedback");
        show("dinstructions");
        unhighlightAll("partc");

        document.querySelector("table.ps_dihybrid").classList.remove("in_part_c");
        document.querySelector("table.ps_dihybrid").classList.add("in_part_d");

        scrollDown();

        // mostly moved to initD
        initD();
    }
}

const expectedGenotypes = [];


function checkD(event) {

    const errors = [];

    // check genotypes entered against global expectedGenotypes, populated by initD
    for(let i=0;i<4;i++) {
        for(let j=0;j<4;j++) {
            let toCheck = document.getElementById("d_" + (i+1) + (j+1));
            if(toCheck.value !== expectedGenotypes[i][j]) {
                errors.push(toCheck);
            }
        }
    }

    if (errors.length > 0) {
        show("cfeedback");
        unhighlightAll("partc");
        highlight(errors);
        errors[0].focus();
    } else {
        hide("cfeedback");
        show("einstructions");
        unhighlightAll("partc");

        // copy genotype label from input to associated span
        const inputs = document.querySelectorAll(".flyzone input");
        const spans = document.querySelectorAll(".flyzone span.genotype_label");
        
        for(let i=0;i<inputs.length;i++) {
            spans[i].innerHTML = inputs[i].value;
            inputs[i].classList.add("hidden");
            inputs[i].disabled = true;
        }

        // add phenotype event listeners and make Part E items visible
        document.querySelectorAll(".flyzone img.phenotype_changeable").forEach(function (x) {
            x.classList.remove("hidden");
            x.addEventListener("click", phenotypeClick);
            x.draggable = false;
        });

        document.querySelector("table.ps_dihybrid").classList.remove("in_part_d");

        scrollDown();


        event.target.removeEventListener("click", checkD);
        event.target.addEventListener("click", checkE);
    }
}

function checkE(event) {

    const errors = [];

    // use expectedGenotypes to find the associated phenotype, then check that the data-src is correct
    for(let i=0;i<4;i++) {
        for(let j=0;j<4;j++) {
            let toCheck = document.getElementById("e_" + (i + 1) + (j + 1));
            let phenotype = toCheck.dataset["src"];
            phenotype = phenotype.substring(0,phenotype.length-4);
            if (phenotype !== pFromG(expectedGenotypes[i][j])) {
                errors.push(toCheck);
            }
        }
    }

    if (errors.length > 0) {
        show("cfeedback");
        unhighlightAll("partc");
        highlight(errors);
        errors[0].focus();
    } else {
        hide("cfeedback");
        show("partf");
        unhighlightAll("partc");

        // remove phenotype clicker
        document.querySelectorAll(".flyzone img.phenotype_changeable").forEach(function (x) {
            x.removeEventListener("click", phenotypeClick);
        });

        scrollDown();

        hide("ccheck");

        // disable button#checkc
        event.target.disabled = true;
    }
}

// for f and g:
/* f ids = gr_f#
   f order = EEAA, EEAa, EeAA, EeAa, eeAA, eeAa, EEaa, Eeaa, eeaa
   should be 1:2:2:4 :1:2 :1:2 :1

   g ids = pr_g#
   g order = wt, eb, ap, ebap
   should be 9:3:3:1
*/

function checkF(event) {

    const errors = [];

    const correct = [1,2,2,4,1,2,1,2,1];

    for(let i=1;i<=9;i++) {
        let e = document.getElementById("gr_f" + i);
        if(correct[i-1] !== parseInt(e.value)) {
            errors.push(e);
        }
    }

    if (errors.length > 0) {
        show("ffeedback");
        unhighlightAll("partf");
        highlight(errors);
        errors[0].focus();
    } else {
        hide("ffeedback");
        hide("fcheck");
        show("partg");
        unhighlightAll("partf");

        // disable inputs
        document.querySelectorAll("div#partf input").forEach(function(x) { x.disabled = true; });

        scrollDown();
        // disable checkf
        event.target.disabled = true;
    }
}

function checkG(event) {

    const errors = [];

    const correct = [9,3,3,1];

    for(let i=1;i<=4;i++) {
        let e = document.getElementById("pr_g" + i);
        if(correct[i-1] !== parseInt(e.value)) {
            errors.push(e);
        }
    }

    if (errors.length > 0) {
        show("ffeedback");
        unhighlightAll("partg");
        highlight(errors);
        errors[0].focus();
    } else {
        hide("ffeedback");
        hide("gcheck")
        show("endtext");
        unhighlightAll("partg");

        // disable inputs
        document.querySelectorAll("div#partg input").forEach(function(x) { x.disabled = true; });


        scrollDown();

        // disable checkg
        event.target.disabled = true;
    }
}



function initC() {
    for(let i=1;i<=4;i++) {
        let f = document.getElementById("b_f"+i);
        let m = document.getElementById("b_m"+i);

        f.classList.add("hidden");
        m.classList.add("hidden");

        let fd = document.getElementById("b_f" + i + "_div");
        let md = document.getElementById("b_m" + i + "_div");

        fd.querySelector(".gamete").innerHTML = f.value;
        md.querySelector(".gamete").innerHTML = m.value;

        fd.classList.remove("hidden");
        md.classList.remove("hidden");
    }
}

/* phenotype click/change handler */

const phenotypeCycle = ["blank.png", "wildtype.png", "ebony.png", "apterous.png", "ebonyapterous.png"];

function phenotypeClick(event) {
    const currentIndex = phenotypeCycle.indexOf(event.target.dataset["src"]);
    const newSrc = phenotypeCycle[(currentIndex) % 4 + 1];
    event.target.src = newSrc;
    event.target.dataset["src"] = newSrc;
    event.target.dispatchEvent(new Event("change"));
}

function initD() {
    // lock draggables
    document.querySelectorAll(".draggable").forEach(function (x) {
        x.draggable = "false";
        x.removeEventListener("dragstart", gameteDragStart);
        x.removeEventListener("click", gameteDragStartClick);
        x.removeEventListener("keyup", gameteDragStartEnter);
        x.removeAttribute("tabindex");
    });

    // lock drop zones
    document.querySelectorAll(".gametedropzone").forEach(function (x) {
        x.removeEventListener("dragover", gameteDragOver);
        x.removeEventListener("drop", gameteDrop);
        x.removeEventListener("click", gameteDropClick);
        x.removeEventListener("keyup", gameteDropEnter);
    });

    // make Part D items visible
    document.querySelectorAll(".flyzone input").forEach(function (x) {
        x.classList.remove("hidden");
    });
    document.querySelectorAll(".flyzone span.genotype_label").forEach(function (x) {
        x.classList.remove("hidden");
    });

    event.target.removeEventListener("click", checkC);
    event.target.addEventListener("click", checkD);

    const motherGametes = [];
    for (let i = 0; i < 4; i++) {
        motherGametes[i] = document.getElementById("gdz_f" + (i + 1)).querySelector("div.gamete");
    }

    for (let i = 0; i < 4; i++) {
        let father = document.getElementById("gdz_f" + (i + 1)).querySelector("div.gamete");
        expectedGenotypes.push([]);
        for (let j = 0; j < 4; j++) {
            let result = "";
            let mother = motherGametes[j];

            let f = [father.innerText.charAt(0), father.innerText.charAt(1)];
            let m = [mother.innerText.charAt(0), mother.innerText.charAt(1)];

            if (f[0] === m[0]) { // could be EE or ee, order doesn't matter
                result += f[0] + m[0];
            } else { // must be Ee
                result += "Ee";
            }

            if (f[1] === m[1]) { // could be AA or aa, order doesn't matter
                result += f[1] + m[1];
            } else { // must be Aa
                result += "Aa";
            }

            expectedGenotypes[i][j] = result;
        }
    }

    document.getElementById("d_11").focus();
}


/* drag and drop event handlers */

function gameteDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    event.dataTransfer.dropEffect = "copy";
}

function gameteDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

function gameteDrop(event) {
    const data = event.dataTransfer.getData("text/plain");

    // this is a swap; do NOT swap unless the mother/father class matches
    if(event.currentTarget.querySelector(".draggable")) {
        
        const node1 = document.getElementById(data);
        const node2 = event.currentTarget.children[0];

        if(node1.parentElement.classList.contains("inputs") &&
           !(node1.classList.contains("mother") && node2.classList.contains("mother")) && 
           !(node1.classList.contains("father") && node2.classList.contains("father")) 
          ) {
            return;        
        }

        if(node1.parentElement.classList.contains("inputs")) {
            // make sure that node1's ph is visible and node2's ph is invisible again...
            // we know things may get out of order here, but it's the only way to keep things
            // even somewhat consistent under "normal" usage
            document.getElementById(data + "_ph").classList.remove("hidden");
            document.getElementById(node2.id + "_ph").classList.add("hidden");
        }

        event.preventDefault();

        node1.parentElement.appendChild(node2);
        event.currentTarget.appendChild(node1);
        // trigger a change event on both node1 and node2
        node1.dispatchEvent(new Event("change"));
        node2.dispatchEvent(new Event("change"));
        return;
    } 

    event.preventDefault();

    // remove drop zone indicator
    if(document.getElementById(data).parentElement.classList.contains("gametedropzone")) {
        document.getElementById(data).parentElement.appendChild(event.currentTarget.querySelector("div.dropzone_indicator"));
        document.getElementById(data).parentElement.tabIndex = 0;
    } else if(event.currentTarget.querySelector("div.dropzone_indicator")) {
        event.currentTarget.querySelector("div.dropzone_indicator").remove();
        event.currentTarget.removeAttribute("tabindex");
    }

    // Get the id of the target and add the moved element to the target's DOM
    event.currentTarget.appendChild(document.getElementById(data));

    // also ensure the target's placeholder element is visible
    document.getElementById(data+"_ph").classList.remove("hidden");

    // send a change event
    event.currentTarget.dispatchEvent(new Event("change"));
}

let selectedGamete = null;

function selectGamete(target) {
    if (selectedGamete !== null && selectedGamete.parentElement.classList.contains("gametedropzone")) {
        if (target.parentElement.classList.contains("gametedropzone")) {
            return;
        }
    } else if (selectedGamete !== null && target.parentElement.classList.contains("gametedropzone")) {
        return;
    }
    selectedGamete = target;
    showSelected();
}

function dropGamete(target) {
    if (selectedGamete !== null && target.children[0] !== selectedGamete) {
        let e = new Event("drop");
        e.dataTransfer = new DataTransfer();
        e.dataTransfer.setData("text/plain", selectedGamete.id);
        e.dataTransfer.dropEffect = "move";
        target.dispatchEvent(e);
        selectedGamete.classList.remove("gameteSelected");
        selectedGamete = null;
    }
}

function gameteDragStartClick(event) {
    selectGamete(event.currentTarget);
}

function gameteDragStartEnter(event) {
    if(event.key === "Enter") {
        selectGamete(event.currentTarget);
        if (selectedGamete !== null) {
            if (parseInt(document.querySelector(".gametedropzone").tabIndex) === 0) {
                document.querySelector(".gametedropzone").focus();
            } else {
                document.querySelector(".gametedropzone").querySelector(".draggable").focus();
            }
        }
    }

}

function gameteDropClick(event) {
    dropGamete(event.currentTarget);
}

function gameteDropEnter(event) {
    if(event.key === "Enter") {
        dropGamete(event.currentTarget);
        if(document.querySelectorAll(".gametedropzone .draggable").length === 8) {
            document.getElementById("ccheck").focus();
        } else {
            document.querySelector(".draggable").focus();
        }
    }
}


function showSelected() {
    if(document.querySelector(".gameteSelected") !==  null) {
        document.querySelector(".gameteSelected").classList.remove("gameteSelected");
    }

    selectedGamete.classList.add("gameteSelected");
}

/* utility functions */
function pFromG(genotype) {
    if (genotype === "eeaa") return "ebonyapterous";
    if (genotype === "Eeaa" || genotype === "EEaa") return "apterous";
    if (genotype === "eeAa" || genotype === "eeAA") return "ebony";
    return "wildtype";
}

function show(id) {
    document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
    document.getElementById(id).classList.add("hidden");
}

function highlight(elements) {
    for (let e of elements) {
        e.addEventListener("change", unhighlight);
        e.addEventListener("drop", unhighlight);
        e.classList.remove("unhighlighted");
        e.classList.add("highlighted");
    }
}

// event listener to unhighlight an element on change - attached by highlight function, above
function unhighlight(event) {
    event.target.classList.remove("highlighted");
    event.target.classList.add("unhighlighted");
    event.target.removeEventListener("change", unhighlight);
}

function unhighlightAll(parent) {
    let p = document.getElementById(parent);

    p.querySelectorAll(".unhighlighted").forEach(function(x) {
        x.classList.remove("unhighlighted");
    });

    p.querySelectorAll(".highlighted").forEach(function (x) {
        x.classList.remove("highlighted");
    });
}

function resetAndDisable(elements) {
    for (let e of elements) {
        if (e) {
            e.classList.remove("unhighlighted");
            e.classList.remove("highlighted");
            e.disabled = true;
        }
    }
}

function scrollDown() {
    document.getElementById("whitespacefix").scrollIntoView({ behavior: "smooth" });
}

// continue drag and drop here: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

/*
Extra to-do list:
- also allow for click once to "pick up", click again to "drop" -> we'll need entirely different handlers for those
- prevent labels from moving after drag/drop -> dummy div?
- make draggables "disappear" while being dragged
- better responsiveness -- right now there's a definite minimum width required...

*/

init();