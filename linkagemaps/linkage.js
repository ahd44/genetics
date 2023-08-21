/*
    images are stored in the order of genes: dachshund, cinnabar, blackbody, vestigial

    the wild-type fly is "wildtype.png"; a single mutation is, e.g., "cinnabar.png"

    multiple mutations concatenate mutation names IN ABOVE ORDER, with an underscore between:
    e.g. "dachshund_cinnabar_blackbody"

    I don't think the ones with more than two mutations are used, but they're included for future purposes.
*/

// settings for progress bar animation -- how many ticks, what is total delay for each day
// total time will be delay * 7 milliseconds -> with delay=500, takes 3.5 s
const ticks = 10;
const delay = 500;

// allow for password skipping, for dev use/demo purposes
// note: it's very easy to find the passwords in the code, as they are in plain text... 
//   obfuscating them serves no real purpose here, as students should "want" to wait to continue.
const skipPasswords = false;

// global variables used to help keep track of state
const selectedPhenotypes = {
    "dachshund": false,
    "cinnabar": false,
    "blackbody": false,
    "vestigial": false
};

const locations = {
    "dachshund": 35,
    "cinnabar": 57,
    "blackbody": 40,
    "vestigial": 65
};

// for partk - number of progeny of:
// AaBb, aabb, aaBb, Aabb respectively
// respectively
const numProgeny = [0, 0, 0, 0];

// for parto, same order as above
const chiSquareStat = [0, 0, 0, 0];

let gene1, gene2;

// global variables for day counter(s)
let dayCounterId = "day_counter", dayProgressId = "day_progress", nextPart = "partd", intStopId = 0;

function init() {
    document.querySelectorAll("img.phenotype.clickable").forEach(function (x) {
        x.addEventListener("click", selectPhenotype);
    });

    document.getElementById("acheck").addEventListener("click", checkA);
    document.getElementById("bcheck").addEventListener("click", checkB);
    document.getElementById("ccheck").addEventListener("click", checkC);
    document.getElementById("dcheck").addEventListener("click", checkD);
    document.getElementById("echeck").addEventListener("click", checkE);
    document.getElementById("fcheck").addEventListener("click", checkF);
    document.getElementById("hcheck").addEventListener("click", checkH);
    document.getElementById("icheck").addEventListener("click", checkI);
    document.getElementById("jcheck").addEventListener("click", checkJ);
    document.getElementById("kcheck").addEventListener("click", checkK);
    document.getElementById("lcheck").addEventListener("click", checkL);
    document.getElementById("mcheck").addEventListener("click", checkM);
    document.getElementById("ncheck").addEventListener("click", checkN);
    document.getElementById("ocheck").addEventListener("click", checkO);
    document.getElementById("pcheck").addEventListener("click", checkP);
    document.getElementById("qcheck").addEventListener("click", checkQ);

    document.getElementById("day_counter").addEventListener("finished", revealNextPart);
    document.getElementById("day_counter2").addEventListener("finished", revealNextPart);
}

function checkA(event) {
    // remove event listeners
    document.querySelectorAll("img.phenotype.clickable").forEach(function (x) {
        x.removeEventListener("click", selectPhenotype);
    });
    event.target.disabled = true;
    // set gene1 and gene2
    if (selectedPhenotypes["dachshund"]) {
        gene1 = "dachshund";
        if (selectedPhenotypes["cinnabar"]) {
            gene2 = "cinnabar";
        } else if (selectedPhenotypes["blackbody"]) {
            gene2 = "blackbody";
        } else {
            gene2 = "vestigial";
        }
    } else if (selectedPhenotypes["cinnabar"]) {
        gene1 = "cinnabar";
        if (selectedPhenotypes["blackbody"]) {
            gene2 = "blackbody";
        } else {
            gene2 = "vestigial";
        }
    } else {
        gene1 = "blackbody";
        gene2 = "vestigial";
    }

    // change b_p1, b_p2; b_g1, b_g2
    document.querySelector("div#b_p1 img").src = gene1 + ".png";
    document.querySelector("div#b_p2 img").src = gene2 + ".png";

    let genotype1 = gene1.charAt(0) + gene1.charAt(0);
    let genotype2 = gene2.charAt(0) + gene2.charAt(0);

    document.getElementById("b_g1").innerText = genotype1 + genotype2.toUpperCase();
    document.getElementById("b_g2").innerText = genotype1.toUpperCase() + genotype2;

    let genelabel = "<em>" + gene1 + "</em> and <em>" + gene2 + "</em>";
    if(gene1 === "blackbody") {
        genelabel = "<em>black body</em> and <em>" + gene2 + "</em>";
    } else if(gene2 === "blackbody") {
        genelabel = "<em>" + gene1 + "</em> and <em>black body</em>";
    }
    document.getElementById("nh_genelabel").innerHTML = genelabel;

    resetPlaceholders();

    show("partb");
    scrollDown();
}

function checkB(event) {
    // b_gg1, b_gg2

    const errors = [];
    const elements = [document.getElementById("b_gg1"), document.getElementById("b_gg2")]

    if (elements[0].value !== gene1.charAt(0) + gene2.charAt(0).toUpperCase()) {
        errors.push(elements[0]);
    }
    if (elements[1].value !== gene1.charAt(0).toUpperCase() + gene2.charAt(0)) {
        errors.push(elements[1]);
    }

    if (errors.length > 0) {
        unhighlightAll("partb");
        highlight(errors);
        errors[0].focus();
        show("bfeedback");
    } else {
        document.getElementById("bcheck").disabled = true;

        resetAndDisable(elements);
        hide("bfeedback");

        show("partc");
        scrollDown();
    }
}



function checkC(event) {
    document.getElementById("ccheck").disabled = true;
    intStopId = setInterval(decrementDayCounter, delay / ticks);
}

/* check D ---
    inputs - d_gg_number# (1-4)
             d_gg_freq# (1-4)
    select - d_gg_pr# (1-4) [parental or recombinant]
*/
function checkD(event) {
    const errors = [];
    const g1 = gene1.charAt(0);
    const g2 = gene2.charAt(0);

    if (event.target.dataset["stage"] === "1") {
        const found = [false, false, false, false];
        // found[0] -> gene1 UPPER, gene2 UPPER
        // found[1] -> gene1 UPPER, gene2 lower
        // found[2] -> gene1 lower, gene2 UPPER
        // found[3] -> gene1 lower, gene2 lower

        // check gamete genotypes d_gg_number#
        for (let i = 1; i <= 4; i++) {
            const element = document.getElementById("d_gg_number" + i);
            const v = element.value;
            if (v.length !== 2) {
                errors.push(element)
            } else {
                if (v.charAt(0) === g1.toUpperCase() && v.charAt(1) === g2.toUpperCase()) {
                    if (found[0]) {
                        errors.push(element)
                    } else {
                        found[0] = true;
                    }
                } else if (v.charAt(0) === g1.toUpperCase() && v.charAt(1) === g2) {
                    if (found[1]) {
                        errors.push(element)
                    } else {
                        found[1] = true;
                    }
                } else if (v.charAt(0) === g1 && v.charAt(1) === g2.toUpperCase()) {
                    if (found[2]) {
                        errors.push(element)
                    } else {
                        found[2] = true;
                    }
                } else if (v.charAt(0) === g1 && v.charAt(1) === g2) {
                    if (found[3]) {
                        errors.push(element)
                    } else {
                        found[3] = true;
                    }
                } else {
                    errors.push(element);
                }
            }
        }
        if (errors.length > 0) {
            unhighlightAll("partd");
            highlight(errors);
            show("dfeedback");
            errors[0].focus();
        } else {
            unhighlightAll("partd");
            hide("dfeedback");
            for (let i = 1; i <= 4; i++) {
                document.getElementById("d_gg_number" + i).disabled = true;
            }
            event.target.dataset["stage"] = "2";
            document.getElementById("dtable").classList.remove("stage1");
            document.getElementById("dtable").classList.add("stage2");
            document.getElementById("d_gg_freq1").focus();
        }
    } else if (event.target.dataset["stage"] === "2") {
        // check frequencies d_gg_freq#
        for (let i = 1; i <= 4; i++) {
            const element = document.getElementById("d_gg_freq" + i);
            const v = element.value;
            if (v !== "1/4" && parseFloat(v) !== 0.25) {
                errors.push(element);
            }
        }

        if (errors.length > 0) {
            unhighlightAll("partd");
            highlight(errors);
            show("dfeedback");
            errors[0].focus();
        } else {
            unhighlightAll("partd");
            hide("dfeedback");
            for (let i = 1; i <= 4; i++) {
                document.getElementById("d_gg_freq" + i).disabled = true;
            }
            event.target.dataset["stage"] = "3";
            document.getElementById("dtable").classList.remove("stage2");
            document.getElementById("d_gg_pr1").focus();
        }
    } else { // assume stage = 3
        // check parental/recomb d_gg_pr#
        // parental genotypes = g1 + g2.toUpper and g1.toUpper + g2
        for (let i = 1; i <= 4; i++) {
            let gg = document.getElementById("d_gg_number" + i).value;
            let recomb = false;
            if (gg === g1 + g2 || gg === g1.toUpperCase() + g2.toUpperCase()) {
                recomb = true;
            }
            let element = document.getElementById("d_gg_pr" + i);
            if (element.value === "none") {
                errors.push(element);
            } else if (element.value === "recombinant" && (!recomb)) {
                errors.push(element);
            } else if (element.value === "parental" && recomb) {
                errors.push(element);
            }
        }

        if (errors.length > 0) {
            unhighlightAll("partd");
            highlight(errors);
            show("dfeedback");
            errors[0].focus();
        } else {
            unhighlightAll("partd");
            hide("dfeedback");
            for (let i = 1; i <= 4; i++) {
                document.getElementById("d_gg_pr" + i).disabled = true;
            }
            document.getElementById("dcheck").disabled = true;
            show("parte");
            scrollDown();
        }
    }
}

function checkE() {
    if (!skipPasswords && document.getElementById("e_password").value === "labrador") {
        document.getElementById("e_password").disabled = true;
        document.getElementById("echeck").disabled = true;
        unhighlightAll("parte");
        hide("efeedback")
        show("partf");
        scrollDown();
    } else {
        highlight([document.getElementById("e_password")]);
        document.getElementById("e_password").focus();
        show("efeedback");
    }
}

/* checkF
  check "f_genotype" for correctness -- shoudl be gene1 + gene2 (all lower case)
- fill in the test cross genotype (g_label1) and phenotype (g_img1) as well as the
   F1 genotype (g_label2) when done */

function checkF() {
    let answer = gene1.charAt(0) + gene1.charAt(0) + gene2.charAt(0) + gene2.charAt(0);
    if (document.getElementById("f_genotype").value !== answer) {
        highlight([document.getElementById("f_genotype")]);
        document.getElementById("f_genotype").focus();
        show("ffeedback");
    } else {
        document.getElementById("fcheck").disabled = true;
        document.getElementById("f_genotype").disabled = true;
        hide("ffeedback");

        document.getElementById("h_label1").innerText = answer;
        document.getElementById("h_img1").src = gene1 + "_" + gene2 + ".png";
        document.getElementById("h_label2").innerText = gene1.charAt(0).toUpperCase()
            + gene1.charAt(0) + gene2.charAt(0).toUpperCase() + gene2.charAt(0);

        show("parth");
        scrollDown();
    }
}

/* checkH
    copied from checkD and modified
*/
function checkH(event) {
    const errors = [];
    const g1 = gene1.charAt(0);
    const g2 = gene2.charAt(0);

    if (event.target.dataset["stage"] === "1") {
        const found = [false, false, false, false];
        // found[0] -> AaBb
        // found[1] -> Aabb
        // found[2] -> aaBb
        // found[3] -> aabb

        // check gamete genotypes h_gg_number#
        for (let i = 1; i <= 4; i++) {
            const element = document.getElementById("h_gg_number" + i);
            const v = element.value;
            if (v.length !== 4) {
                errors.push(element)
            } else {
                if (v.charAt(0) === g1.toUpperCase()
                    && v.charAt(1) === g1
                    && v.charAt(2) === g2.toUpperCase()
                    && v.charAt(3) === g2) {
                    if (found[0]) {
                        errors.push(element)
                    } else {
                        found[0] = true;
                    }
                } else if (v.charAt(0) === g1.toUpperCase()
                    && v.charAt(1) === g1
                    && v.charAt(2) === g2
                    && v.charAt(3) === g2) {
                    if (found[1]) {
                        errors.push(element)
                    } else {
                        found[1] = true;
                    }
                } else if (v.charAt(0) === g1
                    && v.charAt(1) === g1
                    && v.charAt(2) === g2.toUpperCase()
                    && v.charAt(3) === g2) {
                    if (found[2]) {
                        errors.push(element)
                    } else {
                        found[2] = true;
                    }
                } else if (v.charAt(0) === g1
                    && v.charAt(1) === g1
                    && v.charAt(2) === g2
                    && v.charAt(3) === g2) {
                    if (found[3]) {
                        errors.push(element)
                    } else {
                        found[3] = true;
                    }
                } else {
                    errors.push(element);
                }
            }
        }
        if (errors.length > 0) {
            unhighlightAll("parth");
            highlight(errors);
            show("hfeedback");
            errors[0].focus();
        } else {
            unhighlightAll("parth");
            hide("hfeedback");
            for (let i = 1; i <= 4; i++) {
                document.getElementById("h_gg_number" + i).disabled = true;
            }
            event.target.dataset["stage"] = "2";
            document.getElementById("htable").classList.remove("stage1");
            document.getElementById("htable").classList.add("stage2");
            document.getElementById("h_gg_freq1").focus();
        }
    } else if (event.target.dataset["stage"] === "2") {
        // check frequencies h_gg_freq#
        for (let i = 1; i <= 4; i++) {
            const element = document.getElementById("h_gg_freq" + i);
            const v = element.value;
            if (v !== "1/4" && parseFloat(v) !== 0.25) {
                errors.push(element);
            }
        }

        if (errors.length > 0) {
            unhighlightAll("parth");
            highlight(errors);
            show("hfeedback");
            errors[0].focus();
        } else {
            unhighlightAll("parth");
            hide("hfeedback");
            for (let i = 1; i <= 4; i++) {
                document.getElementById("h_gg_freq" + i).disabled = true;
            }
            event.target.dataset["stage"] = "3";
            document.getElementById("htable").classList.remove("stage2");
            document.getElementById("h_gg_pr1").focus();
        }
    } else { // assume stage = 3
        // check parental/recomb h_gg_pr#
        // parental genotypes = g1 + g2.toUpper and g1.toUpper + g2

        for (let i = 1; i <= 4; i++) {
            let gg = document.getElementById("h_gg_number" + i).value;
            let recomb = false;
            if (gg === g1 + g1 + g2 + g2 || gg === g1.toUpperCase() + g1 + g2.toUpperCase() + g2) {
                recomb = true;
            }
            let element = document.getElementById("h_gg_pr" + i);
            if (element.value === "none") {
                errors.push(element);
            } else if (element.value === "recombinant" && (!recomb)) {
                errors.push(element);
            } else if (element.value === "parental" && recomb) {
                errors.push(element);
            }
        }

        if (errors.length > 0) {
            unhighlightAll("parth");
            highlight(errors);
            show("hfeedback");
            errors[0].focus();
        } else {
            unhighlightAll("parth");
            hide("hfeedback");
            for (let i = 1; i <= 4; i++) {
                document.getElementById("h_gg_pr" + i).disabled = true;
            }
            document.getElementById("hcheck").disabled = true;
            show("parti");
            scrollDown();
        }
    }
}

/* checkI
i_parental, i_recombinant
1/2 or .5
*/
function checkI(event) {
    const p = document.getElementById("i_parental");
    const r = document.getElementById("i_recombinant");
    const errors = [];

    if (p.value !== "1/2" && parseFloat(p.value) !== 0.5) {
        errors.push(p);
    }
    if (r.value !== "1/2" && parseFloat(r.value) !== 0.5) {
        errors.push(r);
    }
    if (errors.length > 0) {
        unhighlightAll("parti");
        highlight(errors);
        show("ifeedback");
        errors[0].focus();
    } else {
        unhighlightAll("parti");
        hide("ifeedback");
        p.disabled = true;
        r.disabled = true;
        document.getElementById("icheck").disabled = true;
        show("partj");
        scrollDown();
    }
}

/* checkJ
*/
function checkJ(event) {
    if (!skipPasswords && document.getElementById("j_password").value === "lion") {
        document.getElementById("j_password").disabled = true;
        document.getElementById("jcheck").disabled = true;
        unhighlightAll("partj");
        initK();

        dayCounterId = "day_counter2";
        dayProgressId = "day_progress2";
        nextPart = "partk";
        intStopId = setInterval(decrementDayCounter, delay / ticks);

        hide("jfeedback");
    } else {
        highlight([document.getElementById("j_password")]);
        show("jfeedback");
        document.getElementById("j_password").focus();
    }
}

/* checkK
*/
function checkK(event) {
    const errors = [];

    for (let i = 0; i < 4; i++) {
        let element = document.getElementById("k_number" + (i + 1));
        if (parseInt(element.value) !== numProgeny[i]) {
            errors.push(element);
        }
    }

    if (errors.length > 0) {
        unhighlightAll("partk");
        highlight(errors);
        show("kfeedback");
        errors[0].focus();
    } else {
        unhighlightAll("partk");
        document.getElementById("kcheck").disabled = true;
        hide("kfeedback");
        for (let i = 1; i <= 4; i++) {
            document.getElementById("k_number" + i).disabled = true;
        }
        show("partl");
        scrollDown();
    }
}

/* checkL
*/
function checkL(event) {
    const p = document.getElementById("l_parental");
    const r = document.getElementById("l_recombinant");
    const errors = [];

    const numParental = numProgeny[2] + numProgeny[3];
    const numRecombinant = numProgeny[0] + numProgeny[1];

    const p_freq = (numParental / 56).toFixed(2);
    const r_freq = (numRecombinant / 56).toFixed(2);

    let pvalue = parseFloat(p.value).toFixed(2);
    let rvalue = parseFloat(r.value).toFixed(2);

    //allow for 7/56, but also 1/8 or other fractional reductions
    // should probably disallow some things, but that is too much work
    // for honestly pretty narrow edge cases
    if (p.value.indexOf("/") > 0) {
        let n = parseInt(p.value.substring(0, p.value.indexOf("/")));
        let d = parseInt(p.value.substring(p.value.indexOf("/") + 1));
        pvalue = (n / d).toFixed(2);
    }

    if (r.value.indexOf("/") > 0) {
        let n = parseInt(r.value.substring(0, r.value.indexOf("/")));
        let d = parseInt(r.value.substring(r.value.indexOf("/") + 1));
        rvalue = (n / d).toFixed(2);
        r.value = rvalue;
    }

    if (pvalue !== p_freq) {
        errors.push(p);
    }

    if (rvalue !== r_freq) {
        errors.push(r);
    }

    if (errors.length > 0) {
        unhighlightAll("partl");
        highlight(errors);
        show("lfeedback");
        errors[0].focus();
    } else {
        document.getElementById("lcheck").disabled = true;
        p.value = pvalue;
        r.value = rvalue;
        p.disabled = true;
        r.disabled = true;
        unhighlightAll("partl");
        hide("lfeedback");

        show("partm");
        scrollDown();
    }
}

/* checkM
*/
function checkM(event) {
    if (!skipPasswords && document.getElementById("m_password").value === "zebra") {
        document.getElementById("m_password").disabled = true;
        document.getElementById("mcheck").disabled = true;
        unhighlightAll("partm");
        initChiSquare();
        show("partn");
        scrollDown();
        hide("mfeedback");
    } else {
        highlight([document.getElementById("m_password")]);
        show("mfeedback");
        document.getElementById("m_password").focus();
    }
}

/* chi-square is next: */
function checkN(event) {
    // check:
    // n_ex# (expected number of offspring)
    const errors = [];
    for (let i = 1; i <= 4; i++) {
        let element = document.getElementById("n_ex" + i);
        if (parseInt(element.value) !== 14) {
            errors.push(element);
        }
    }

    if (errors.length > 0) {
        unhighlightAll("partn");
        highlight(errors);
        show("nfeedback");
        errors[0].focus();
    } else {
        unhighlightAll("partn");
        hide("nfeedback");
        document.getElementById("ncheck").disabled = true;
        for (let i = 1; i <= 4; i++) {
            document.getElementById("n_ex" + i).disabled = true;
        }
        show("parto");
        scrollDown();
    }
}

function checkO(event) {
    // check:
    // o_css# (chi square statistic calculation to 2 decimal places)
    // o_csstot (total chi-square statistic)
    const errors = [];

    for (let i = 0; i < 4; i++) {
        let element = document.getElementById("o_css" + (i + 1));

        if (parseFloat(element.value).toFixed(2) !== chiSquareStat[i].toFixed(2)) {
            errors.push(element);
        }
    }

    let cssTot = chiSquareStat.reduce(((a, x) => x + a), 0);
    let element = document.getElementById("o_csstotal");

    if (Number.isNaN(parseFloat(element.value)) || Math.abs(cssTot - parseFloat(element.value)) > 0.02) { // should be max margin of error due to rounding?
        errors.push(element);
    }
    

    if (errors.length > 0) {
        unhighlightAll("parto");
        highlight(errors);
        show("ofeedback");
        errors[0].focus();
    } else {
        unhighlightAll("parto");
        hide("ofeedback");
        document.getElementById("ocheck").disabled = true;
        document.getElementById("o_csstotal").disabled = true;
        for (let i = 1; i <= 4; i++) {
            document.getElementById("o_css" + i).disabled = true;
        }
        show("partp");
        scrollDown();
    }
}

function checkP(event) {
    let pval = pValue();
    let element = document.getElementById("p_pvalue");
    if (parseFloat(element.value) !== pval) {
        unhighlightAll("partp");
        highlight([element]);
        show("pfeedback");
        element.focus();
    } else {
        unhighlightAll("partp");
        hide("pfeedback");
        element.disabled = true;
        document.getElementById("pcheck").disabled = true;
        show("partq");
        scrollDown();
    }
}

function checkQ(event) {
    // check:
    // q_reject (select -> value="reject" is correct)
    let element = document.getElementById("q_reject");
    if (element.value !== "reject") {
        unhighlightAll("partq");
        highlight([element]);
        show("qfeedback");
        element.focus();
    } else {
        unhighlightAll("partq");
        hide("qfeedback");
        element.disabled = true;
        document.getElementById("qcheck").disabled = true;
        show("partr");
        scrollTo()
    }
}

// listeners

function selectPhenotype(event) {
    const phenotype = event.target.dataset["phenotype"];
    if (selectedPhenotypes[phenotype]) {
        event.target.classList.remove("selected");
    } else {
        event.target.classList.add("selected");
    }
    selectedPhenotypes[phenotype] = !(selectedPhenotypes[phenotype]);

    let ps = 0;
    if (selectedPhenotypes["dachshund"]) ps++;
    if (selectedPhenotypes["cinnabar"]) ps++;
    if (selectedPhenotypes["blackbody"]) ps++;
    if (selectedPhenotypes["vestigial"]) ps++;

    if (ps === 2) {
        document.getElementById("acheck").disabled = false;
    } else {
        document.getElementById("acheck").disabled = true;
    }
}

// initializers 

function initK() {
    const container = document.getElementById("k_progeny");

    const probability = Math.abs(locations[gene1] - locations[gene2]) / 100;

    //k_p1 is already wild-type
    document.getElementById("k_p2").src = gene1 + "_" + gene2 + ".png";
    document.getElementById("k_p3").src = gene1 + ".png";
    document.getElementById("k_p4").src = gene2 + ".png";

    let pvalue = 1;

    // determine number of progeny; if p-value > 0.05, redo.
    while (pvalue === 1) {
        //reset array
        numProgeny[0] = 0;
        numProgeny[1] = 0;
        numProgeny[2] = 0;
        numProgeny[3] = 0;
        for (let i = 0; i < 56; i++) {
            //generate
            if (Math.random() < probability) {
                // generate recombinant fly: AaBb or aabb
                if (Math.random() < .5) {
                    numProgeny[0]++;
                } else {
                    numProgeny[1]++;
                }
            } else {
                // generate parental fly: aaBb or Aabb
                if (Math.random() < .5) {
                    numProgeny[2]++;
                } else {
                    numProgeny[3]++;
                }
            }
        }

        // chi-square stat generation:
        for (let i = 0; i < 4; i++) {
            chiSquareStat[i] = (numProgeny[i] - 14) * (numProgeny[i] - 14) / 14;
        }

        pvalue = pValue(); //uses chiSquareStat global to get p-value
    }

    // now make the images, then shuffle them around and append them.
    const images = [];

    //generate 56 progeny from the F1 x test cross fly using gene1 and gene2
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < numProgeny[i]; j++) {
            const newimg = document.createElement("img");
            if (i === 0) {
                newimg.src = "wildtype.png";
            } else if (i === 1) {
                newimg.src = gene1 + "_" + gene2 + ".png";
            } else if (i === 2) {
                newimg.src = gene1 + ".png";
            } else {
                newimg.src = gene2 + ".png";
            }
            images.push(newimg);
        }
    }

    // Fisher-Yates array shuffle    
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = images[i];
        images[i] = images[j];
        images[j] = temp;
    }

    for (let img of images) {
        container.appendChild(img);
    }
}

function initChiSquare() {
    // fill in:
    let g1 = gene1.charAt(0);
    let g2 = gene2.charAt(0);

    for (let i = 1; i <= 4; i++) {
        let ng = document.getElementById("n_g" + i);
        let og = document.getElementById("o_g" + i);

        let nf = document.getElementById("n_f" + i);
        let noff = document.getElementById("n_off" + i);
        let ocsc = document.getElementById("o_csc" + i);

        // ng and og - genotypes
        if (i === 1) { // wt -> AaBb
            ng.innerText = g1.toUpperCase() + g1 + g2.toUpperCase() + g2;
            og.innerText = ng.innerText;
        } else if (i === 2) { // rec/rec -> aabb
            ng.innerText = g1 + g1 + g2 + g2;
            og.innerText = ng.innerText;
        } else if (i === 1) { // rec/dom -> aaBb
            ng.innerText = g1 + g1 + g2.toUpperCase() + g2;
            og.innerText = ng.innerText;
        } else { // dom/rec -> Aabb
            ng.innerText = g1.toUpperCase() + g1 + g2 + g2;
            og.innerText = ng.innerText;
        }

        // noff and nf - number offspring observed, frequency observed
        noff.innerText = numProgeny[i - 1];
        nf.innerText = (numProgeny[i - 1] / 56).toFixed(2);

        ocsc.innerHTML = "(" + (numProgeny[i - 1]) + " &ndash; " +
            "14)<sup>2</sup> / 14";

    }
}

function pValue() {
    // given the numProgeny array, what is the p-value?
    let cssTot = numProgeny.reduce(function (a, x) {
        return a + (x - 14) * (x - 14) / 14;
    }, 0);

    if (cssTot >= 11.34) {
        return 0.01;
    } else if (cssTot >= 7.82) {
        return 0.05;
    } else { //we don't actually care, just want to make sure it's below 0.05
        return 1;
    }
}

/* general utility */

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

    p.querySelectorAll(".unhighlighted").forEach(function (x) {
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

function decrementDayCounter() {
    let counter = document.getElementById(dayCounterId);
    if (counter.dataset["days"] === 0) return;
    if (parseInt(counter.dataset["ticks"]) === ticks - 1) {
        counter.dataset["ticks"] = 0;
        let newdays = parseInt(counter.dataset["days"]) - 1;

        if (newdays < 0)
            return;

        counter.dataset["days"] = newdays;
        if (newdays === 0) {
            counter.innerText = "Adult flies emerge!";
        } else {
            counter.innerText = newdays + " days...";
        }
        document.getElementById(dayProgressId).value = (7 - newdays)
        if (newdays === 0) {
            document.getElementById(dayCounterId).dispatchEvent(new Event("finished"));
            clearInterval(intStopId);
        }
    } else {
        counter.dataset["ticks"] = parseInt(counter.dataset["ticks"]) + 1;
        document.getElementById(dayProgressId).value =
            (7 - parseInt(counter.dataset["days"]) + parseInt(counter.dataset["ticks"]) / ticks);
    }

}

function revealNextPart(event) {
    show(nextPart);
    scrollDown();
}

function resetPlaceholders() {
    // get the two genes
    let ph_allele = gene1.charAt(0) + gene2.charAt(0).toUpperCase();
    let ph_genotype = gene1.charAt(0) + ph_allele + gene2.charAt(0) + " (e.g.)";
    ph_allele += " (e.g.)";

    document.querySelectorAll("input.allele-input").forEach(function(x) {
        x.placeholder = ph_allele;
    });

    document.querySelectorAll("input.genotype-input").forEach(function(x) {
        x.placeholder = ph_genotype;
    });

}

init();