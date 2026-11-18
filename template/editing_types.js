


    let g_current_edit_entry = false
    let g_current_edit_contact = false
    function setup_edit_response() {
        //
        {
            let edit_props_manager = window._x_edit_properties_management
            let entrys_entry_view = edit_props_manager.view
            //
            entrys_entry_view.route("update-author", function(target, event) {
                let store = edit_props_manager.store
                // Update the proxified store, the copy of the element from the list
                store[0].author = target.value;
                g_current_edit_entry.author = target.value;
                entry_time_update(store[0],g_current_edit_entry)
            });
            entrys_entry_view.route("update-title", function(target, event) {
                let store = edit_props_manager.store
                // Update the proxified store, the copy of the element from the list
                store[0].title = target.value;
                g_current_edit_entry.title = target.value;
                entry_time_update(store[0],g_current_edit_entry)
            });
        }
        //
        let msg_editor = document.getElementById("entrys_entry_message_contents_edit")
        if ( msg_editor ) {
            msg_editor.addEventListener('input', (event) => {
                if ( g_current_edit_entry ) {
                    g_current_edit_entry.text = event.target.innerHTML
                    update_just_date(g_current_edit_entry,"edit-entrys-entry-date")
                    g_current_edit_entry.dirty = true
                }
            });
        }
    }




        // // contacts 
        // //
        // let contact_editor = document.getElementById("contact_contents_edit")
        // if ( contact_editor ) {
        //     contact_editor.addEventListener('input', (event) => {
        //         if ( g_current_edit_contact ) {
        //             g_current_edit_contact.text = event.target.innerHTML
        //             update_just_date(g_current_edit_contact,"edit-contact-date")
        //             update_just_date(g_current_edit_contact,"view-contact-date")
        //             g_current_edit_contact.dirty = true
        //         }
        //     });
        // }
        // //
        // let c_prop_el = document.getElementById("edit-contact-name")
        // if ( c_prop_el ) {
        //     c_prop_el.addEventListener('change', (event) => {
        //         if ( g_current_edit_contact ) {
        //             g_current_edit_contact.name = event.target.value
        //             update_just_date(g_current_edit_contact,"edit-contact-date")
        //             update_just_date(g_current_edit_contact,"view-contact-date")
        //             g_current_edit_contact.dirty = true
        //         }
        //     });
        // }
        // //
        // c_prop_el = document.getElementById("edit-contact-email")
        // if ( c_prop_el ) {
        //     c_prop_el.addEventListener('change', (event) => {
        //         if ( g_current_edit_contact ) {
        //             g_current_edit_contact.email = event.target.value
        //             update_just_date(g_current_edit_contact,"edit-contact-date")
        //             update_just_date(g_current_edit_contact,"view-contact-date")
        //             g_current_edit_contact.dirty = true
        //         }
        //     });
        // }