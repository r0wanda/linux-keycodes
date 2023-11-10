import got from 'got';
import _ora from 'ora';
import { join as desm } from 'desm';
import strip from 'strip-comments';
import { readFileSync as rf, writeFileSync as wf } from 'node:fs';

const HFILE = desm(import.meta.url, 'codes.h');
const JFILE = desm(import.meta.url, 'codes.json');
const rBlank = (i: string) => i.length > 0 && !i.match(/\s/);
const ora = (text: string) => _ora({ text }).start();

async function dl(verbose = true, url = 'https://cdn.jsdelivr.net/gh/torvalds/linux@master/include/uapi/linux/input-event-codes.h', file = HFILE) {
    let spin: undefined | ReturnType<typeof ora> = undefined;
    if (verbose) spin = ora('Downloading event codes');
    const res = await got(url).text();
    wf(file, res);
    if (verbose) spin?.succeed(`Events downloaded and saved to ${file}`);
}
function procParen(st: string, full: Codes) {
    st = st.replace(/[\(\)]/g, '');
    let a = st.split('');
    a = a.filter(rBlank);
    var res = [''];
    var i = 0;
    var oper = [];
    for (var c of st) {
        if (c.match(/[+-]/)) {
            oper.push(c);
            i++;
            res.push('');
            continue;
        }
        res[i] = res[i] + c;
    }
    let r: number = -1;
    var f = true;
    for (var _s of res) {
        const s = parseInt(_s);
        switch (oper[0]) {
            case '+': {
                if (!isNaN(s)) r += s;
                else r += full[s];
                oper.shift();
            }
            case '-': {
                if (!isNaN(s)) r -= s;
                else r -= full[s];
                oper.shift();
            }
            default: {
                if (!isNaN(s)) r = s;
                else r = full[s];
                f = false;
            }
        }
    }
    return r;
}
function parse(verbose: boolean, inf = HFILE, out = JFILE) {
    let spin: undefined | ReturnType<typeof ora> = undefined;
    if (verbose) spin = ora('Parsing events');
    const h = rf(inf, 'utf8').split('\n');
    const p: {
        [key: string]: number | undefined;
    } = {};
    for (let s of h) {
        s = s.trim();
        if (!s.startsWith('#define')) continue;
        s = strip(s);
        const l = s.split(/\s/).filter(rBlank);
        if (verbose && spin) spin.text = `Processing event ${l[1]}`;
        if (l.length === 2) {
            p[l[1]] = undefined;
        } else if (l[2].startsWith('(')) {
            p[l[1]] = procParen(l[2], <Codes>p);
        } else if (p[l[2]] !== undefined) {
            p[l[1]] = p[l[2]];
        } else if (l.length > 2) {
            p[l[1]] = parseInt(l[2]);
        }
    }
    if (out) wf(out, JSON.stringify(p));
    if (verbose) spin?.succeed(`Parsed codes and saved to ${out}`);
    return <Codes>p;
}

async function gen(verbose = false) {
    await dl(verbose);
    parse(verbose);
}

export default gen;
