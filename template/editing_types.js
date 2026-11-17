

    window.edit_properties_of = (entry)  => {
        let entrys_entry_store = store_of_entrys_entry_manager("${main_type}")
        if ( entrys_entry_store ) { // simple array
            let ventry = entrys_entry_store[0]
            for ( let ky in entry ) {
                ventry[ky] = entry[ky]
            }
        }
    }


// update_reader_selection_tab_with_checked

let tab_objects = objects.map(obj => {
    return {
        "id" : obj.id,
        "subject" : obj.title     // <---   subject or other
    }
})





    function unload_entrys_entry_for_undo(entry) {
        if ( entry ) {
            let id = entry.id
            let sender = entry.sender
            let recipient = entry.recipient
            let cc = entry.cc
            let subject = entry.subject
            let text = entry.text
            let date = entry.date
            let timestamp = entry.timestamp
            entry.dirty = false
            return { id, sender, recipient, cc, subject, text, date, timestamp }
        }
    }


    function reload_entrys_entry_by_undo(entry,old_values) {
        if ( entry ) {
            entry.id = old_values.id
            entry.sender = old_values.sender
            entry.recipient = old_values.recipient
            entry.cc = old_values.cc
            entry.subject = old_values.subject
            entry.text = old_values.text
            entry.date = old_values.date
            entry.timestamp = old_values.timestamp
            entry.dirty = false
        }
    }

    function unequal_objects(save_entry,stored_entry) {
        if ( save_entry && stored_entry ) {
            if ( save_entry.id !== stored_entry.id ) return true
            if ( save_entry.sender !== stored_entry.sender ) return true
            if ( save_entry.recipient !== stored_entry.recipient ) return true
            if ( save_entry.cc !== stored_entry.cc ) return true
            if ( save_entry.subject !== stored_entry.subject ) return true
            if ( save_entry.text !== stored_entry.text ) return true
            if ( save_entry.date !== stored_entry.date ) return true
            if ( save_entry.timestamp !== stored_entry.timestamp ) return true
        }
        return true
    }

    function update_contact_properties_view(cid) {
        let contact = get_entry_from_store('contacts',cid)
        if ( contact ) {
            g_current_edit_contact = contact
            //
            let m_prop_el = document.getElementById("view-contact-name")
            if ( m_prop_el ) { m_prop_el.innerHTML = contact.name }
            m_prop_el = document.getElementById("view-contact-entry")
            if ( m_prop_el ) { m_prop_el.innerHTML = contact.email }
            //
            m_prop_el = document.getElementById("edit-contact-name")
            if ( m_prop_el ) { m_prop_el.value = contact.name }
            m_prop_el = document.getElementById("edit-contact-email")
            if ( m_prop_el ) { m_prop_el.value = contact.email }
            //
            m_prop_el = document.getElementById("view-contact-date")
            if ( m_prop_el ) { m_prop_el.innerHTML = contact.date }
            m_prop_el = document.getElementById("edit-contact-date")
            if ( m_prop_el ) { m_prop_el.innerHTML = contact.date }
            //
        } else {
            alert("no message")
        }
    }


    function unload_contact_for_undo(contact) {
        if ( contact ) {
            let name = contact.name
            let email = contact.email
            let date = contact.date
            let text = contact.text
            let id = contact.id
            let timestamp = contact.timestamp
            contact.dirty = false
            return { id, name, email, text, date, timestamp }
        }
    }


    function reload_contact_by_undo(contact,old_values) {
        if ( contact ) {
            contact.name = old_values.name
            contact.email = old_values.email
            contact.date = old_values.date
            contact.text = old_values.text
            contact.id = old_values.id
            contact.imestamp = old_values.timestamp
        }
    }




    let g_current_edit_entry = false
    let g_current_edit_contact = false
    function setup_edit_response() {
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
        //
        let m_prop_el = document.getElementById("edit-entrys-entry-sender")
        if ( m_prop_el ) {
            m_prop_el.addEventListener('change', (event) => {
                if ( g_current_edit_entry ) {
                    g_current_edit_entry.sender = event.target.value
                    update_just_date(g_current_edit_entry,"edit-entrys-entry-date")
                    g_current_edit_entry.dirty = true
                }
            });
        }
        //
        // m_prop_el = document.getElementById("edit-entrys-entry-recipient")
        // if ( m_prop_el ) {
        //     m_prop_el.addEventListener('change', (event) => {
        //         if ( g_current_edit_entry ) {
        //             g_current_edit_entry.recipient = event.target.value
        //             update_just_date(g_current_edit_entry,"edit-entrys-entry-date")
        //             g_current_edit_entry.dirty = true
        //         }
        //     });
        // }
        //
        // m_prop_el = document.getElementById("edit-entrys-entry-cc")
        // if ( m_prop_el ) {
        //     m_prop_el.addEventListener('change', (event) => {
        //         if ( g_current_edit_entry ) {
        //             g_current_edit_entry.cc = event.target.value
        //             update_just_date(g_current_edit_entry,"edit-entrys-entry-date")
        //             g_current_edit_entry.dirty = true
        //         }
        //     });
        // }
        // //
        // m_prop_el = document.getElementById("edit-entrys-entry-bcc")
        // if ( m_prop_el ) {
        //     m_prop_el.addEventListener('change', (event) => {
        //         if ( g_current_edit_entry ) {
        //             g_current_edit_entry.bcc = event.target.value
        //             update_just_date(g_current_edit_entry,"edit-entrys-entry-date")
        //             g_current_edit_entry.dirty = true
        //         }
        //     });
        // }
        //
        m_prop_el = document.getElementById("edit-entrys-entry-subject")
        if ( m_prop_el ) {
            m_prop_el.addEventListener('change', (event) => {
                if ( g_current_edit_entry ) {
                    g_current_edit_entry.subject = event.target.value
                    update_just_date(g_current_edit_entry,"edit-entrys-entry-date")
                    g_current_edit_entry.dirty = true
                }
            });
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

    }


    // item view support
    function update_entrys_entry_properties_view(mtype,msg_id) {
        //
        let entry = get_entry_from_store(mtype,msg_id)
        if ( entry ) {
            g_current_edit_entry = entry
            edit_properties_of(entry)
            if ( entry.attachments ) {
                clear_atts_list('view')
                add_atts_to_list('view',entry.attachments)
            }
            indicate_page_on_window_banner(mtype)
        }
        //
    }






    async function is_ready_to_publish_entrys_entry(entry) {
        // is_ready_to_send_entry
        if ( entry ) {
            // ---- ---- ---- ---- ---- ---- ---- ----
            let recipient = entry.recipient
            let sender = entry.sender
            let subject = entry.subject
            let text = entry.text
            let ready = true
            // ---- ---- ---- ---- ---- ---- ---- ----
            ready &&= (recipient.length !== 0)
            ready &&= (sender.length !== 0)
            ready &&= (subject.length !== 0)
            ready &&= (text.length !== 0)

            if ( !ready ) {
                let user_should_see = {}
                if (sender.length === 0) {
                    user_should_see.sender = true  // not optional
                }
                if (recipient.length === 0) {
                    user_should_see.recipient = true  // not optional
                }
                if (subject.length === 0) {
                    user_should_see.subject = true  // not optional
                }
                if (text.length === 0) {
                    user_should_see.text = false  //    optional
                }
                ready = await g_confirmation_modal.stylish_confirm(user_should_see)
            }

            return ready
        }
        return false
    }
