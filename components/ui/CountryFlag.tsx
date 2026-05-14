import Flag from 'react-world-flags';

interface CountryFlagProperties {
  code: string;
}

export default function CountryFlag({ code }: CountryFlagProperties) {
  return (
    <Flag
      code={code}
      className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
      fallback={
        <span className="inline-flex h-3.5 w-5 items-center justify-center rounded-[2px] bg-slate-200 text-[7px] font-bold text-slate-400">
          {code}
        </span>
      }
    />
  );
}
