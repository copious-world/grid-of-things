
    //
    function view_from_${el}(msg_id) {
        let sect_box = `#entrys_entry_view`
        let msg_view = document.getElementById("entrys_entry_message_contents")
        if ( msg_view ) {
            update_entrys_entry_properties_view("${el}",msg_id)
            let clear_text = get_text_from_store("${el}",msg_id)
            msg_view.innerHTML = `picked message id = ${msg_id} <br> ${clear_text}`
        }
        pinBox(sect_box)
    }
