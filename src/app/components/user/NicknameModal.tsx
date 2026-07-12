import { useState } from "react";
import { checkNickname, setNickname } from "@/app/services/userService";

const NICKNAME_RE = /^[가-힣a-zA-Z0-9]{2,12}$/;

interface Props {
  onComplete: (nickname: string) => void;
}

export function NicknameModal({ onComplete }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false); // 중복확인 통과 여부
  const [busy, setBusy] = useState(false);

  const handleChange = (v: string) => {
    setValue(v);
    setChecked(false); // 입력이 바뀌면 중복확인 다시
    setError(null);
  };

  const handleCheck = async () => {
    if (!NICKNAME_RE.test(value)) {
      setError("2~12자 한글/영문/숫자만 사용할 수 있습니다.");
      return;
    }
    setBusy(true);
    try {
      const res = await checkNickname(value);
      const data = res.data.data;
      if (data?.available) {
        setChecked(true);
        setError(null);
      } else {
        setError(data?.reason ?? "이미 사용 중인 닉네임입니다.");
      }
    } catch {
      setError("중복 확인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!checked || busy) return;
    setBusy(true);
    try {
      await setNickname(value);
      onComplete(value);
    } catch {
      // 409(방금 선점) 포함 — 재확인 유도
      setChecked(false);
      setError("방금 사용된 닉네임입니다. 다른 닉네임을 입력해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-slate-800 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">닉네임을 정해주세요</h2>
        <p className="mt-1 text-sm text-gray-400">
          다른 사용자에게 표시될 이름입니다. (2~12자, 한글/영문/숫자)
        </p>
        <div className="mt-4 flex gap-2">
          <input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (checked ? handleSave() : handleCheck())}
            maxLength={12}
            placeholder="닉네임 입력"
            className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCheck}
            disabled={busy || value.length < 2}
            className="rounded-lg bg-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-500 disabled:opacity-50"
          >
            중복확인
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {checked && !error && (
          <p className="mt-2 text-sm text-green-400">사용 가능한 닉네임입니다.</p>
        )}
        <button
          onClick={handleSave}
          disabled={!checked || busy}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          저장
        </button>
      </div>
    </div>
  );
}
