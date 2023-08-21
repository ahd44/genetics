
function init() {
    document.getElementById("acheck").addEventListener("click", checkA);
    document.getElementById("bcheck").addEventListener("click", checkB);
    document.getElementById("ccheck").addEventListener("click", checkC);
    document.getElementById("dcheck").addEventListener("click", checkA);
    document.getElementById("echeck").addEventListener("click", checkB);
    document.getElementById("fcheck").addEventListener("click", checkC);
    document.getElementById("gcheck").addEventListener("click", checkA);
    document.getElementById("hcheck").addEventListener("click", checkB);
    document.getElementById("icheck").addEventListener("click", checkC);
    document.getElementById("jcheck").addEventListener("click", checkA);
    document.getElementById("kcheck").addEventListener("click", checkB);
    document.getElementById("lcheck").addEventListener("click", checkC);
    let ratios = document.querySelectorAll("table.ratios input");
    for(let r of ratios) {
        r.addEventListener("change", updateRatio);
    }
}

// a-c = EE x ee
// d-f = EE x Ee
// g-i = Ee x ee
// j-l = Ee x Ee
function checkA(e) {
    let prefix = e.target.dataset["prefix"];

    let a1 = document.getElementById(prefix+"a1").value;
    let b1 = document.getElementById(prefix+"b1").value;
    let a2,b2;
    if(document.getElementById(prefix+"a2") !== null)
        a2 = document.getElementById(prefix + "a2").value;
    if (document.getElementById(prefix + "b2") !== null)
        b2 = document.getElementById(prefix+"b2").value;

    // a1, a2 = father gametes; b1, b2 = mother gametes

    let errors = [];
    let dom = ["Eb","Eb","E"];
    let rec = ["eb","e"];

    if(prefix === "a" || prefix === "d") {
        if(!dom.includes(a1)) {
            errors.push("a1");
        }
    }

    if(prefix === "a" || prefix === "g") {
        if (!rec.includes(b1)) {
            errors.push("b1")
        }
    }

    if(prefix === "d" || prefix === "j") {
        if(dom.includes(b1) || rec.includes(b1)) {
            // b1 is correct
            if(dom.includes(b1) && (!rec.includes(b2))) {
                errors.push("b2");
            } else if(rec.includes(b1) && (!dom.includes(b2))) {
                errors.push("b2");
            }
        } else {
            errors.push("b1");
            if(!(dom.includes(b2) || rec.includes(b2))) {
                errors.push("b2")
            }
        }
    }

    if(prefix === "g" || prefix === "j") {
        if (dom.includes(a1) || rec.includes(a1)) {
            // a1 is correct
            if (dom.includes(a1) && (!rec.includes(a2))) {
                errors.push("a2");
            } else if (rec.includes(a1) && (!dom.includes(a2))) {
                errors.push("a2");
            }
        } else {
            errors.push("a1");
            if (!(dom.includes(a2) || rec.includes(a2))) {
                errors.push("a2")
            }
        }
    }

    if(errors.length > 0) {
        show(prefix + "feedback");
        highlight(prefix, errors);
        scrollDown();
        document.getElementById(prefix + errors[0]).focus();
    } else {
        hide(prefix + "feedback");
        let nextfix = String.fromCharCode(prefix.charCodeAt(0)+1);
        show("part" + nextfix);
        resetAndDisable(prefix, ["a1", "a2", "b1", "b2"]);
        e.target.disabled = true;
        scrollDown();
    }
}

// b, e, h, k
function checkB(e) {
    let prefix = e.target.dataset["prefix"];
    let errors = [];
    if(e.target.dataset["stage"] === "genotype") {
        let a = document.getElementById(prefix+"1").value;
        let b = document.getElementById(prefix+"2").value;
        let c = document.getElementById(prefix+"3").value;
        switch(prefix) {
            case "b":
                if(parseInt(a) !== 0) errors.push("1");
                if(parseInt(b) !== 4) errors.push("2");
                if(parseInt(c) !== 0) errors.push("3");
                break;
            case "e":
                if (parseInt(a) !== 1) errors.push("1");
                if (parseInt(b) !== 1) errors.push("2");
                if (parseInt(c) !== 0) errors.push("3");
                break;
            case "h":
                if (parseInt(a) !== 0) errors.push("1");
                if (parseInt(b) !== 2) errors.push("2");
                if (parseInt(c) !== 2) errors.push("3");
                break;
            case "k":
                if (parseInt(a) !== 1) errors.push("1");
                if (parseInt(b) !== 2) errors.push("2");
                if (parseInt(c) !== 1) errors.push("3");
                break;
        }
        // b = 0:4:0
        // e = 1:1:0
        // h = 0:2:2
        // k = 1:2:1
        if (errors.length > 0) {
            show(prefix + "feedback");
            highlight(prefix, errors);
            scrollDown();
            document.getElementById(prefix + errors[0]).focus();
        } else {
            hide(prefix + "feedback");
            hide(prefix + "phenotype_placeholder");
            show("part" + prefix + "2");
            resetAndDisable(prefix, ["1","2","3"]);
            e.target.dataset["stage"] = "phenotype";
            document.getElementById(prefix + "4").focus();
            scrollDown();
        }
    } else {
        let y = document.getElementById(prefix + "4").value;
        let z = document.getElementById(prefix + "5").value;
        // b = 4:0
        // e = 2:0
        // h = 2:2
        // j = 3:1
        switch (prefix) {
            case "b":
                if (parseInt(y) !== 4) errors.push("4");
                if (parseInt(z) !== 0) errors.push("5");
                break;
            case "e":
                if (parseInt(y) !== 2) errors.push("4");
                if (parseInt(z) !== 0) errors.push("5");
                break;
            case "h":
                if (parseInt(y) !== 2) errors.push("4");
                if (parseInt(z) !== 2) errors.push("5");
                break;
            case "k":
                if (parseInt(y) !== 3) errors.push("4");
                if (parseInt(z) !== 1) errors.push("5");
                break;
        }

        if (errors.length > 0) {
            show(prefix + "feedback");
            highlight(prefix, errors);
            scrollDown();
            document.getElementById(prefix + errors[0]).focus();
        } else {
            hide(prefix + "feedback");
            let nextfix = String.fromCharCode(prefix.charCodeAt(0) + 1);
            show("part" + nextfix);
            resetAndDisable(prefix, ["4","5"]);
            e.target.disabled = true;
            scrollDown();
        }
    }
}

// c, f, i, l
function checkC(e) {
    let prefix = e.target.dataset["prefix"];
    if(e.target.dataset["stage"] === "finished") {
        let nextfix = String.fromCharCode(prefix.charCodeAt(0) + 1);
        show("part" + nextfix);
        show(prefix + nextfix + "separator");
        e.target.disabled = true;
        scrollDown();
    } else {
        let ta = document.getElementById(prefix + "1");
        if(ta.value.length > 10) {
            hide(prefix + "feedback");
            show(prefix + "explanation")
            e.target.dataset["stage"] = "finished";
            resetAndDisable(prefix, ["1"]);
            scrollDown();
        } else {
            show(prefix + "feedback");
            highlight(prefix, ["1"]);
            scrollDown();
            ta.focus();
        }
    }
}

// b, e, h, k - ratio watcher
function updateRatio(e) {
    let prefix = e.target.dataset["prefix"];
    let postfix = e.target.dataset["postfix"]

    let ratioId = prefix + "ratio" + postfix;
    let ratio = document.getElementById(ratioId);

    if(postfix === "g") {
        if(e.target.id === prefix + "1") {
            ratio.dataset["homodom"] = e.target.value;
        } else if(e.target.id === prefix + "2") {
            ratio.dataset["hetero"] = e.target.value;
        } else if(e.target.id === prefix + "3") {
            ratio.dataset["homorec"] = e.target.value
        }
        let homodom, hetero, homorec;
        homodom = parseInt(ratio.dataset["homodom"]);
        hetero  = parseInt(ratio.dataset["hetero"]);
        homorec = parseInt(ratio.dataset["homorec"]);
        let normFactor;
        if(homodom === 0) {
            if(hetero === 0) {
                if(homorec === 0) {
                    normFactor = 1; // all zero
                } else {
                    normFactor = homorec; // homorec is non-zero
                }
            } else if(homorec === 0) { // hetero is non-zero
                normFactor = hetero
            } else { //homorec is non-zero
                if(hetero % homorec === 0 || homorec % hetero === 0) {
                    normFactor = Math.min(hetero, homorec);
                } else {
                    normFactor = 1
                }
            }
        } else if(hetero === 0) { //homodom is non-zero
            if(homorec === 0) { 
                normFactor = homodom;
            } else { //homorec is also non-zero
                if (homodom % homorec === 0 || homorec % homodom === 0) {
                    normFactor = Math.min(homodom, homorec);
                } else {
                    normFactor = 1
                }
            }
        } else if(homorec === 0) { //homodom and hetero are non-zero
            if (hetero % homodom === 0 || homodom % hetero === 0) {
                normFactor = Math.min(homodom, hetero);
            } else {
                normFactor = 1
            }
        } else { // all are non-zero
            if ((hetero % homodom === 0 || homodom % hetero === 0) && (hetero % homorec === 0 || homorec % hetero === 0) && (homodom % homorec === 0 || homorec % homodom === 0)) {
                normFactor = Math.min(homodom, hetero, homorec)
            } else {
                normFactor = 1;
            }
        }
        
        homodom /= normFactor;
        hetero /= normFactor;
        homorec /= normFactor;
        ratio.innerHTML = homodom + ":" + hetero + ":" + homorec;
    } else if(postfix === "p") {
        if (e.target.id === prefix + "4") {
            ratio.dataset["wildtype"] = e.target.value;
        } else if (e.target.id === prefix + "5") {
            ratio.dataset["ebony"] = e.target.value;
        } 
        let wildtype, ebony;
        wildtype = parseInt(ratio.dataset["wildtype"]);
        ebony = parseInt(ratio.dataset["ebony"]);
        let normFactor;
        if(wildtype === 0) {
            if(ebony === 0) {
                normFactor = 1;
            } else {
                normFactor = ebony;
            }
        } else if(ebony === 0) {
            normFactor = wildtype;
        } else {
            if(wildtype % ebony === 0 || ebony % wildtype === 0) {
                normFactor = Math.min(wildtype, ebony);
            } else {
                normFactor = 1;
            }
        }
        wildtype /= normFactor;
        ebony /= normFactor;
        ratio.innerHTML = wildtype + ":" + ebony;
    }
}

function show(id) {
    document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
    document.getElementById(id).classList.add("hidden");
}

function highlight(prefix, elements) {
    for(let e of elements) {
        let target = document.getElementById(prefix + e);
        target.addEventListener("change",unhighlight);
        target.classList.remove("unhighlighted");
        target.classList.add("highlighted");
    }
}

function unhighlight(e) {
    e.target.classList.remove("highlighted");
    e.target.classList.add("unhighlighted");
    e.target.removeEventListener("change", unhighlight);
}

function scrollDown() {
    document.getElementById("whitespacefix").scrollIntoView({ behavior: "smooth" });
}

function resetAndDisable(prefix, elements) {
    for (let e of elements) {
        let target = document.getElementById(prefix + e);
        if(target) {
            target.classList.remove("unhighlighted");
            target.classList.remove("highlighted");
            target.disabled = true;
        }
    }
}

init();