#include <glib.h>
#include <glib-object.h>
#include <gio/gio.h>
#include <stdlib.h>
#include <unistd.h>

static void on_bus_aquired(GDBusConnection* conn, const gchar* name, gpointer null);
static void handle_method_call(GDBusConnection       *connection,
                               const gchar           *sender,
                               const gchar           *object_path,
                               const gchar           *interface_name,
                               const gchar           *method_name,
                               GVariant              *parameters,
                               GDBusMethodInvocation *invocation,
                               gpointer               user_data);


static GDBusNodeInfo* introspection_data = NULL;
static const gchar introspection_xml[] =
        "<node>"
        "  <interface name='local.control'>"
        ""
        "    <method name='Exit'>"
        "    </method>"
        ""
        "  </interface>"
        "</node>";
static const GDBusInterfaceVTable interface_vtable =
{
        handle_method_call,
        NULL,
        NULL
};

static GMainLoop* loop_ = NULL;

gint main(gint argc, gchar** argv)
{
        loop_ = g_main_loop_new(NULL, FALSE);

        g_bus_own_name(G_BUS_TYPE_SESSION,
                       "com.weintek.dtctrl.ic",
                       G_BUS_NAME_OWNER_FLAGS_NONE,
                       on_bus_aquired,
                       NULL,
                       NULL,
                       NULL,
                       NULL);

        g_main_loop_run(loop_);
        g_main_loop_unref(loop_);

        g_dbus_node_info_unref(introspection_data);
        return 0;
}

static void
on_bus_aquired(GDBusConnection* conn, const gchar* name, gpointer null)
{
        introspection_data = g_dbus_node_info_new_for_xml(introspection_xml, NULL);
        g_dbus_connection_register_object(conn,
                                          "/",
                                          introspection_data->interfaces[0],
                                          &interface_vtable,
                                          NULL,
                                          NULL,
                                          NULL);
}

static void
handle_method_call(GDBusConnection       *connection,
                   const gchar           *sender,
                   const gchar           *object_path,
                   const gchar           *interface_name,
                   const gchar           *method_name,
                   GVariant              *parameters,
                   GDBusMethodInvocation *invocation,
                   gpointer               user_data)
{
        if (g_strcmp0(method_name, "Exit") == 0)
        {
                //g_main_loop_quit(loop_);
                 printf("Exit\n");
                 g_dbus_method_invocation_return_value(invocation, NULL);
        }
}
