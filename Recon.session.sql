select avg(contador) from (

select count(*) as contador, month(DataEvento) as mes from Eventoes where YEAR(DataEvento) = 2023 group by month(DataEvento) order by 2 
)