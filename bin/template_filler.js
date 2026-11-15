
const fs = require('fs')


const value_files = process.argv[2]
console.log(value_files)

let conf_args_str = fs.readFileSync(value_files).toString()
let conf_args = JSON.parse(conf_args_str)


// "$id(${canonical})"
function convet_fname_to_abstract(fname,abstract_vname) {
    let fparts = fname.split('(')
    let rest = fparts[1]
    let vpart = rest.substring(0,rest.lastIndexOf(')')).trim()
    fname = fname.replace(vpart,abstract_vname)
    return fname
}


function parse_and_satisfy_file(file_data) {
console.log("parse_and_satisfy_file",file_data)
    return file_data
}

// ---- ---- ---- ----
let func_table = {
    "$id" : (vname) => {vname},
    "$tmpl_lines" : (file_data) => {
        return parse_and_satisfy_file(file_data)
    }
}

let tables_of_libs = {
    "func_table" : func_table
}

console.dir(conf_args)

let template_file = conf_args.template_file
let output_file = conf_args.output_file
if ( template_file && output_file ) {
    let tfile = fs.readFileSync(template_file).toString()
    let funcs = conf_args.funcs
    let vars = conf_args.vars
    //
    for ( let [funcall,directive] of Object.entries(funcs) ) {
console.log(funcall)
        let replacer = ""
        let loop_template = directive.template
        if ( loop_template === undefined ) {
            let t_file = directive.file
            if ( t_file ) {
                try {
                    loop_template = fs.readFileSync(t_file).toString()
                } catch (e) {
                    continue
                }
            } else continue
        }
        let par_lst_var = directive["${el}"]
        let sep = ""
        if ( par_lst_var ) {
            let var_lst = vars[par_lst_var]
            for ( let el of var_lst ) {
                let nxt_line = loop_template.replaceAll("${el}",el)
                replacer += sep + "\n" + nxt_line
                sep = directive.sep ? directive.sep : ""
            }
        } else {

        // "funcs" : "func_table",
        // "fkey" : "$id",
        // "${vars}" : "canonical"
            let dirctv = structuredClone(directive)

            let funcs = dirctv.funcs
            delete dirctv.funcs
            let tiny_lib = tables_of_libs[funcs]
            if ( tiny_lib ) {
                let fname = dirctv.fkey
                delete dirctv.fkey
                let func = tiny_lib[fname]
                let keys_left = Object.keys(dirctv)
                for ( let var_collection of keys_left ) {
                    if ( var_collection.startsWith("${") ) {
                        let vkey = var_collection.replace("${","").replace("}","").trim()
                        let subvars = conf_args[vkey]
        console.log(vkey,subvars,dirctv,var_collection)
                        let value
                        if ( dirctv[var_collection] === "one_shot" ) {
                            if ( dirctv.file ) {
                                try {
                                    let vdata = fs.readFileSync(dirctv.file).toString()
                                    value = vdata
                                } catch (e) {
                                    continue
                                }
                            }
                        } else {
                            value = subvars[dirctv[var_collection]]
                        }
                        replacer += "\n" + func(value)
                    }
                }
            }
        }
        tfile = tfile.replaceAll(funcall,replacer)
    }

    for ( let [avar,value] of Object.entries(vars) ) {
        if ( typeof value !== 'string' ) {
            if ( Array.isArray(value) ) {
                value = JSON.stringify(value)
            } else {
                value = JSON.stringify(value,null,4)
            }
        }
        tfile = tfile.replaceAll(`$\{${avar}}`,value)
    }
    //
    fs.writeFileSync(output_file,tfile)
    //
}