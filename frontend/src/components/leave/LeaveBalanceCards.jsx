import React from 'react';
import { Palmtree, Thermometer, UserCheck, AlertTriangle } from 'lucide-react';

export const LeaveBalanceCards = ({ balances = {}, onApplyClick }) => {
  const cards = [
    {
      type: 'ANNUAL',
      label: 'Annual Paid Leave',
      allocated: 15,
      balance: balances.ANNUAL ?? 15,
      icon: Palmtree,
      color: 'blue',
      barColor: 'bg-blue-500'
    },
    {
      type: 'CASUAL',
      label: 'Casual Leave',
      allocated: 10,
      balance: balances.CASUAL ?? 10,
      icon: UserCheck,
      color: 'emerald',
      barColor: 'bg-emerald-500'
    },
    {
      type: 'SICK',
      label: 'Sick Leave',
      allocated: 10,
      balance: balances.SICK ?? 10,
      icon: Thermometer,
      color: 'amber',
      barColor: 'bg-amber-500'
    },
    {
      type: 'UNPAID',
      label: 'Unpaid / Loss of Pay',
      allocated: 0,
      balance: balances.UNPAID ?? 0,
      icon: AlertTriangle,
      color: 'slate',
      barColor: 'bg-slate-500',
      isUnpaid: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const used = c.isUnpaid ? c.balance : Math.max(0, c.allocated - c.balance);
        const percentUsed = c.isUnpaid ? 0 : Math.min(100, Math.round((used / c.allocated) * 100));

        return (
          <div
            key={c.type}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{c.label}</span>
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 mono">{c.balance}</span>
                <span className="text-xs text-slate-400 font-medium">{c.isUnpaid ? 'Days Deducted' : `of ${c.allocated} days left`}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              {!c.isUnpaid ? (
                <>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Used: {used} days</span>
                    <span>{percentUsed}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.barColor} rounded-full`} style={{ width: `${percentUsed}%` }} />
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-slate-500">
                  Total loss-of-pay shortfall
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
