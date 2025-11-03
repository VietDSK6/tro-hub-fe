import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meProfile, upsertMeProfile } from "@/api/profiles";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MapPicker from "@/components/map/MapPicker";
import { useState, useEffect } from "react";

const schema = z.object({
  bio: z.string().min(1),
  budget: z.coerce.number().min(0),
  lng: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Profile(){
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey:["me"], queryFn: meProfile });
  const { register, handleSubmit, setValue, formState:{errors}, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [point, setPoint] = useState<[number,number]|null>(null);

  useEffect(()=>{
    if (!data) return;
    reset({ bio: data.bio || "", budget: data.budget || 0 });
    const c = data?.location?.coordinates;
    if (c) { setPoint([c[0], c[1]]); setValue("lng", c[0]); setValue("lat", c[1]); }
  }, [data]);

  const up = useMutation({
    mutationFn: (d:FormData)=> upsertMeProfile({
      bio: d.bio, budget: d.budget,
      location: (d.lng!=null && d.lat!=null) ? { type:"Point", coordinates:[d.lng, d.lat] } : undefined
    }),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:["me"] })
  });

  const onPick = (lng:number, lat:number)=>{ setPoint([lng,lat]); setValue("lng", lng); setValue("lat", lat); };

  return (
    <div className="container-app p-4 max-w-2xl space-y-3">
      <h1 className="h1">Hồ sơ</h1>
      <form className="card p-4 space-y-3" onSubmit={handleSubmit((d)=>up.mutate(d))}>
        <div>
          <div className="label">Giới thiệu</div>
          <textarea className="input h-28" {...register("bio")}/>
          {errors.bio && <div className="text-xs text-red-600">{String(errors.bio.message)}</div>}
        </div>
        <div>
          <div className="label">Ngân sách (đ)</div>
          <input className="input" type="number" step="1000" {...register("budget")}/>
          {errors.budget && <div className="text-xs text-red-600">{String(errors.budget.message)}</div>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="label">Lng</div>
            <input className="input" {...register("lng")}/>
          </div>
          <div>
            <div className="label">Lat</div>
            <input className="input" {...register("lat")}/>
          </div>
        </div>
        <MapPicker value={point} onChange={onPick}/>
        <div className="pt-2"><button className="btn btn-primary" type="submit">Lưu</button></div>
      </form>
    </div>
  );
}
