
frappe.ui.form.on('Sales Order', {
    refresh: function(frm) {
        if (frm.doc.docstatus === 1) {
            frm.add_custom_button(__('Add Payment'), function() {
                frappe.prompt([
                    {'fieldname': 'paid_amount', 'label': 'Paid Amount', 'fieldtype': 'Currency', 'reqd': 1, 'default': frm.doc.grand_total},
                    {'fieldname': 'mode_of_payment', 'label': 'Mode of Payment', 'fieldtype': 'Link', 'options': 'Mode of Payment', 'reqd': 1},
                    {'fieldname': 'posting_date', 'label': 'Posting Date', 'fieldtype': 'Date', 'default': frappe.datetime.nowdate()}
                ],
                function(values){
                    frappe.call({
                        method: 'frappe.client.insert',
                        args: {
                            doc: {
                                doctype: 'Payment Entry',
                                payment_type: 'Receive',
                                party_type: 'Customer',
                                party: frm.doc.customer,
                                posting_date: values.posting_date,
                                paid_amount: values.paid_amount,
                                received_amount: values.paid_amount,
                                mode_of_payment: values.mode_of_payment,
                                references: [{
                                    reference_doctype: 'Sales Order',
                                    reference_name: frm.doc.name,
                                    total_amount: frm.doc.grand_total,
                                    outstanding_amount: frm.doc.grand_total,
                                    allocated_amount: values.paid_amount
                                }]
                            }
                        },
                        callback: function(r) {
                            if (!r.exc) {
                                frappe.msgprint(__('Payment Entry {0} created', [r.message.name]));
                                frm.reload_doc();
                            }
                        }
                    });
                },
                __('New Payment'),
                __('Create')
                );
            });

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Payment Entry Reference",
                    fields: ["parent", "allocated_amount"],
                    filters: {
                        reference_doctype: "Sales Order",
                        reference_name: frm.doc.name
                    }
                },
                callback: function(r) {
                    if (r.message) {
                        frm.clear_table("payment_references");
                        let entries = r.message;
                        entries.forEach(function(ref) {
                            frappe.call({
                                method: "frappe.client.get",
                                args: {
                                    doctype: "Payment Entry",
                                    name: ref.parent
                                },
                                callback: function(pe_data) {
                                    let row = frm.add_child("payment_references");
                                    row.payment_entry = pe_data.message.name;
                                    row.paid_amount = pe_data.message.paid_amount;
                                    row.posting_date = pe_data.message.posting_date;
                                    row.mode_of_payment = pe_data.message.mode_of_payment;
                                    frm.refresh_field("payment_references");
                                }
                            });
                        });
                    }
                }
            });
        }
    }
});
