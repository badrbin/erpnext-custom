import frappe
from frappe.utils import flt

def execute(filters=None):
    columns = [
        {"label": "العميل", "fieldname": "customer", "fieldtype": "Link", "options": "Customer", "width": 200},
        {"label": "إجمالي أوامر البيع", "fieldname": "total_sales_orders", "fieldtype": "Currency", "width": 180},
        {"label": "إجمالي الفواتير", "fieldname": "total_sales_invoices", "fieldtype": "Currency", "width": 180},
        {"label": "إجمالي سندات التسليم", "fieldname": "total_delivery_notes", "fieldtype": "Currency", "width": 180},
    ]

    data = []
    customers = frappe.get_all("Customer", fields=["name"])
    for c in customers:
        customer = c.name

        sales_order_total = frappe.db.sql("""SELECT SUM(base_grand_total) FROM `tabSales Order`
            WHERE customer = %s AND docstatus = 1""", customer)[0][0] or 0

        sales_invoice_total = frappe.db.sql("""SELECT SUM(base_grand_total) FROM `tabSales Invoice`
            WHERE customer = %s AND docstatus = 1""", customer)[0][0] or 0

        delivery_note_total = frappe.db.sql("""SELECT SUM(base_grand_total) FROM `tabDelivery Note`
            WHERE customer = %s AND docstatus = 1""", customer)[0][0] or 0

        data.append({
            "customer": customer,
            "total_sales_orders": flt(sales_order_total),
            "total_sales_invoices": flt(sales_invoice_total),
            "total_delivery_notes": flt(delivery_note_total),
        })

    return columns, data
