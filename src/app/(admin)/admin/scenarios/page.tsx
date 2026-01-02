import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Manage Scenarios - Admin",
};

export default async function AdminScenariosPage() {
  const supabase = createClient();

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Scenarios</h1>
        <Link href="/admin/scenarios/new/edit">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </Link>
      </div>

      {scenarios && scenarios.length > 0 ? (
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{scenario.title}</h3>
                      {scenario.is_published ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                      {scenario.is_pro_only && (
                        <Badge variant="outline">Pro Only</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{scenario.slug}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {scenario.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/scenarios/${scenario.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No scenarios yet.</p>
            <Link href="/admin/scenarios/new/edit">
              <Button>Create Your First Scenario</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
