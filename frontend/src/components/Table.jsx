import EmptyState from './EmptyState';

const Table = ({
  columns = [],
  data = [],
  className = '',
  emptyMessage = 'No records found',
  emptyDescription = 'There are no records matching your selected filters.',
  onRowClick,
  hoverable = true,
  headerVariant = 'softBlue', // 'softBlue' | 'light' | 'white'
}) => {
  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} description={emptyDescription} />;
  }

  return (
    <div className={`overflow-x-auto rounded-2xl border border-[#dde5ec] bg-white shadow-premium-sm ${className}`}>
      <table className="min-w-full divide-y divide-[#e7f0fa] text-sm">
        <thead
          className={`sticky top-0 z-10 ${
            headerVariant === 'light'
              ? 'bg-[#f1f5f8] text-[#1c2b33] border-b border-[#dde5ec]'
              : 'bg-[#f1f5f8] text-[#0064e0] border-b border-[#dde5ec]'
          }`}
        >
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-5 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider whitespace-nowrap ${
                  headerVariant === 'light' ? 'text-slate-600' : 'text-[#0064e0]'
                } ${column.headerClassName || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#e7f0fa]">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                transition-colors duration-150 group
                ${hoverable ? 'hover:bg-[#e7f0fa]/60' : ''}
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-5 py-3.5 text-slate-700 font-medium ${column.cellClassName || 'whitespace-nowrap'} group-hover:text-[#1c2b33]`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
