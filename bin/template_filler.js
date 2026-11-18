
const fs = require('fs')


const value_files = process.argv[2]
console.log(value_files)

let conf_args_str = fs.readFileSync(value_files).toString()
let conf_args = JSON.parse(conf_args_str)


// "$id(${canonical})"
function convert_fname_to_abstract(fname,abstract_vname) {
    let fparts = fname.split('(')
    let rest = fparts[1]
    let vpart = rest.substring(0,rest.lastIndexOf(')')).trim()
    fname = fname.replace(vpart,abstract_vname)
    return fname
}


function calc_conf_values(val) {
    if ( val === "${date_local_string}" ) {
        val = (new Date()).toLocaleString()
    } else if ( val = "${timestamp}" ) {
        val = Date.now()
    }
    return val
}

/*
do i in [0..3] {
$template:section_switch(${switch_types[i]})
$template:link_panel(${switch_types[i]})
}

$template:section_switch(blog)
$template:link_panel(blog)
$template:section_switch(create)
$template:link_panel(create)
$template:section_switch(filtered)
$template:link_panel(filtered)
$template:section_switch(manage)
$template:link_panel(manage)

<ul id="ul-create">
    $gen:list_els(switch_links,blog)
</ul>

"switch_to_el" : "<li><button onclick=\"$action('${ctype}')\" >${ctype}</button></li>",
"simple_action" : "<li><button onclick=\"$action()\" >${action_ky}</button></li>",

{
  'write new': { action: 'entrys_entry_create()', template: 'switch_to_el' },
  drafts: { action: 'entrys_entry_switch_to($ky)', template: 'switch_to_el' },
  published: { action: 'entrys_entry_switch_to($ky)', template: 'switch_to_el' }
}

{
  'search ${main_type}': { action: "search_ui('${main_type}')", template: 'simple_action' },
  spacer1: 'shadow_line',
  preferences: { action: 'manage_prefs()', template: 'simple_action' }
}

handle this one case for now
*/

function ends_from_range(a_range) {
    a_range = a_range.replace('[','').replace(']','')
    let rparts = a_range.split('..')
    rparts = rparts.map(ii => parseInt(ii.trim()))
    return rparts
}

// "$gen$imports_value_map(${entrys_entry_proto})" 
// "$gen$inline$keys_of,unload_entrys_entry_for_undo(${entrys_entry_proto})"
//
function process_any_subs(pre_figured) {
    if ( pre_figured.indexOf("$gen:")  > 0 ) {
        let lines = pre_figured.split('\n')
        lines = lines.map(line => {
            let replaced = line
            if ( line.indexOf("$gen:")  > 0 ) {
console.log("process_any_subs", line)
                let replacer = line.substring(line.indexOf("$gen:"),line.lastIndexOf(')')+1)
                let oper = replacer.substring("$gen:".length,replacer.indexOf('('))
                let func = func_table[oper]
                if( func ) {
                    let pars = replacer.substring(replacer.indexOf('(')+1.,replacer.indexOf(')'))
console.log("process_any_subs", pars)
                    pars = pars.split(',').map(p => p.trim())
                    replaced = func(...pars)
                }
console.log(replacer)
                return replaced
            }
            return line
        })
        return lines.join('\n')
    }
    return pre_figured
}


function populate_list_template(t_vars_ky,ctype) {
    let ctype_selections = conf_args.vars[t_vars_ky]
console.log(ctype_selections,t_vars_ky,ctype)
    let sel_def_list = ctype_selections[ctype]
    let output = ""
    for ( let [title,entry_spec] of Object.entries(sel_def_list) ) {
        if ( typeof entry_spec === "string" ) {
            let template_id = entry_spec
            output += conf_args.templates[template_id] + "\n"
        } else {
            let main_type = conf_args.vars.main_type
            let template_id = entry_spec.template
            let action = entry_spec.action
            let template = conf_args.templates[template_id]
            let ky = ""
            if ( title.indexOf('$') >= 0 ) {
                title = title.replaceAll("${ctype}",ctype)
                title = title.replaceAll("${main_type}",main_type)
            } else {
                ky = title
                if ( entry_spec.ky !== undefined ) {
                    ky = entry_spec.ky
                }
            }
            if ( action.indexOf('$') >= 0 ) {
                action = action.replaceAll("${ctype}",ctype)
                action = action.replaceAll("${main_type}",main_type)
            }
            template = template.replaceAll("${ky}",ky)
            template = template.replaceAll("${ctype}",ctype)
            template = template.replaceAll("${title}",title)
            template = template.replaceAll("${action}",action)
            output += template + "\n"
        }
    }
    return output
}


var template_for_subst = ""
var last_file = ""
function load_file_then_subsitute(line,ith) {
    //
    let descriptor = conf_args.funcs[line]
// console.log("LOAD_FILE_THEN_SUBSITUTE")
// console.dir(descriptor)
    if ( descriptor ) {
        let file_name = descriptor.file
        try {
            if ( last_file !== file_name ) {
                template_for_subst = fs.readFileSync(file_name).toString()
            }
            last_file = file_name
            let values = conf_args.vars[descriptor["${el}"]]
            let value = values[ith]
            if ( value !== undefined ) {
                let output = "" + template_for_subst
                output = output.replaceAll("${el}",value)
                return output
            }
        } catch (e) {
console.log(e)
        }
    }
    //
    return "could have been here"
}

function parse_and_satisfy_file(file_data) {
console.log("parse_and_satisfy_file",file_data)
    let output = file_data
    file_data =file_data.trim()
    if ( file_data[0] === '$' ) {
        let lines = file_data.split('\n')
        console.log(lines)
    } else if ( file_data.startsWith('do ') ) {
        let small_p = file_data.substring(3).trim()
        let a_var = small_p.substring(0,small_p.indexOf(' ')).trim()
        let a_range = small_p.substring(small_p.indexOf(' ') + 1,small_p.indexOf('{')).trim()
        a_range = a_range.replace('in ',"").trim()
        let body = small_p.substring(small_p.indexOf('{')).trim()
        let lines = body.split('\n')
        lines = lines.map(line => line.trim())
        lines = lines.filter((line) => {
            return ( line !== '{' && line !== '}' )
        })
        console.log(a_range)
        console.log(lines)
        let [start,stop] = ends_from_range(a_range)
        output = ""
        for ( let i = start; i <= stop; i++ ) {
            for ( let line of lines ) {
                let figured = ""
                let thing_in_pars = line.substring(line.indexOf('(')+1,line.lastIndexOf(')'))
console.log("AAAAA   ",thing_in_pars)
                let var_entry = thing_in_pars.substring(thing_in_pars.indexOf('${')+2,thing_in_pars.indexOf('['))
console.log("AAAAA   ",var_entry)
                let values = conf_args.vars[var_entry]
                let value
                if ( Array.isArray(values) ) {
                    value = values[i]
                } else {
                    value = values
                }
                if ( line.startsWith('$template:') ) {
console.log("AAAAA   ", "value", value, "line", line)
                    let template = line.substring('$template:'.length ,line.indexOf('('))
console.log("AAAAA   parse_and_satisfy_file" ,template)
                    template = conf_args.templates[template]
                    let tvar = '${ctype}'
                    figured = template.replaceAll(tvar,value)
                    figured = process_any_subs(figured)
                } else if ( line.startsWith('$load:imports') ) {
                    figured = load_file_then_subsitute(line,i)
                } else {
                    figured = line.replace(thing_in_pars,value)
                }

                output += figured + "\n"
            }
        }
    }
    return output
}

// ---- ---- ---- ----
let func_table = {
    "$id" : (vname) => {vname},
    "$tmpl_lines" : (file_data) => {
        return parse_and_satisfy_file(file_data)
    },
    "list_els" : (t_vars_ky,ctype) => {
        return populate_list_template(t_vars_ky,ctype)
    },
    "starts_with_underscore" : (str) => {
        if ( typeof str === "string" ) {
            return str[0] === '_'
        }
        return false
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
        let only_file = false
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
                if ( (directive["${el}"] === undefined) && (directive["${vars}"] === undefined) ) {
                    only_file = true
                    replacer = loop_template
                }
            } else continue
        }
        let par_lst_var = directive["${el}"]
        let sep = ""
        if ( par_lst_var && !only_file ) {
            let var_lst = vars[par_lst_var]
            if ( Array.isArray(var_lst) ) {
                for ( let el of var_lst ) {
                    let nxt_line = loop_template.replaceAll("${el}",el)
                    replacer += sep + "\n" + nxt_line
                    sep = directive.sep ? directive.sep : ""
                }
            } else if ( typeof var_lst === 'object' ) {
                let par_lst_value = directive["${val}"]
                if ( par_lst_value ) {
                    let skip_func = false
                    if ( directive.skip ) {
                        skip_func = directive.skip
                        skip_func = func_table[skip_func]
                    }
                    for ( let [el,val] of Object.entries(var_lst) ) {
                        if ( skip_func && skip_func(el) ) continue
                        let nxt_line = loop_template.replaceAll("${el}",el)
                        if ( (typeof val === 'string') && val.startsWith('${') ) {
                            val = calc_conf_values(val)
                        }
                        if ( typeof val === 'string' ) {
                            val = `"${val}"`
                        } else if ( typeof val === 'object' ) {
                            val = JSON.stringify(val)
                        }
                        nxt_line = nxt_line.replaceAll("${val}",val)
                        replacer += sep + "\n" + nxt_line
                        sep = directive.sep ? directive.sep : ""
                    }
                } else if ( funcall.indexOf('$inline$') > 0 ) {
                    let kys = Object.keys(var_lst)
                    sep = directive.sep ? directive.sep : ", "
                    replacer = kys.join(sep)
                }
            }
        } else if ( !only_file ) {

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