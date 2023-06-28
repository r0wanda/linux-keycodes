import got from 'got';
import _ora from 'ora';
import { join as desm } from 'desm';
import { readFileSync as rf, writeFileSync as wf } from 'node:fs';

const HFILE = desm(import.meta.url, 'codes.h');
const JFILE = desm(import.meta.url, 'codes.json');
const rBlank = i => i.length > 0 && !i.match(/\s/);
const ora = text => _ora({ text }).start();

async function dl(verbose, url = 'https://cdn.jsdelivr.net/gh/torvalds/linux@master/include/uapi/linux/input-event-codes.h', file = HFILE) {
    if (verbose) var spin = ora('Downloading event codes');
    const res = await got(url).text();
    wf(file, res);
    if (verbose) spin.succeed(`Events downloaded and saved to ${file}`);
}
function procParen(st, full) {
    st = st.replace(/[\(\)]/g, '');
    st = st.split('');
    st = st.filter(rBlank);
    var res = [''];
    var i = 0;
    var oper = [];
    for (var c of st) {
        if (c === '+' || c === '-') {
            oper.push(c);
            i++;
            res.push('');
            continue;
        }
        res[i] = res[i] + c;
    }
    var r = -1;
    var f = true;
    for (var s of res) {
        if (f) {
            if (!isNaN(parseInt(s))) r = s;
            else r = full[s];
            f = false;
        } else if (oper[0] === '+') {
            if (!isNaN(parseInt(s))) r += s;
            else r += full[s];
            oper.shift();
        } else if (oper[0] === '-') {
            if (!isNaN(parseInt(s))) r -= s;
            else r -= full[s];
            oper.shift();
        }
    }
    return r;
}
function parse(verbose, inf = HFILE, out = JFILE) {
    if (verbose) var spin = ora('Parsing events');
    const h = rf(inf, 'utf8').split('\n');
    var p = {};
    for (var l of h) {
        l = l.trim();
        if (!l.startsWith('#define')) continue;
        l = l.split(/\s/);
        l = l.filter(rBlank);
        if (verbose) spin.text = `Processing event ${l[1]}`;
        while (true) {
            var cIdx = l.indexOf('/*')
            if (cIdx === -1) break;
            //console.log((l.indexOf('*/') || (l.length - 1)));
            l.splice(cIdx, l.length - 1 - cIdx + 1);
        }
        if (l.length === 2) {
            p[l[1]] = undefined;
        } else if (l[2].startsWith('(')) {
            p[l[1]] = parseInt(procParen(l[2], p));
        } else if (p[l[2]] !== undefined) {
            p[l[1]] = p[l[2]];
        } else if (l.length > 2) {
            p[l[1]] = parseInt(l[2]);
        }
    }
    if (out) wf(out, JSON.stringify(p));
    if (verbose) spin.succeed(`Parsed codes and saved to ${out}`);
    return p;
}

async function gen(verbose = false) {
    await dl(verbose);
    parse(verbose);
}

export default gen;
